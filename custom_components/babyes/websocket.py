"""Authenticated WebSocket API used by the BabyEs dashboard card."""
from __future__ import annotations

from typing import Any

try:
    import probatio as vol  # Home Assistant 2026+
except ImportError:
    import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .runtime import get_runtime
from .store import Diary, DiaryError


def _diary(hass, connection, msg) -> Diary | None:
    runtime = get_runtime(hass)
    if runtime is None:
        connection.send_error(msg["id"], "not_ready", "BabyEs is not set up or still loading.")
        return None
    return runtime["diary"]


async def _run(hass, connection, msg, action) -> None:
    if (diary := _diary(hass, connection, msg)) is None:
        return
    try:
        result = await action(diary)
    except DiaryError as err:
        # The error code is stable; the card shows it in the user's language.
        connection.send_error(msg["id"], err.code, str(err))
    except OSError as err:
        connection.send_error(msg["id"], "storage_error", str(err))
    else:
        connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): "babyes/list"})
@callback
def ws_list(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    if (diary := _diary(hass, connection, msg)) is not None:
        connection.send_result(msg["id"], {**diary.snapshot(), "name": get_runtime(hass)["name"]})


@websocket_api.websocket_command({vol.Required("type"): "babyes/subscribe"})
@callback
def ws_subscribe(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    if (diary := _diary(hass, connection, msg)) is None:
        return

    @callback
    def on_change() -> None:
        connection.send_event(msg["id"], {"revision": diary.revision})

    connection.subscriptions[msg["id"]] = diary.subscribe(on_change)
    connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): "babyes/sleep/start", vol.Optional("start"): str})
@websocket_api.async_response
async def ws_sleep_start(hass, connection, msg):
    await _run(hass, connection, msg, lambda d: d.start_sleep(msg.get("start")))


@websocket_api.websocket_command({vol.Required("type"): "babyes/sleep/stop"})
@websocket_api.async_response
async def ws_sleep_stop(hass, connection, msg):
    await _run(hass, connection, msg, lambda d: d.stop_sleep())


@websocket_api.websocket_command({
    vol.Required("type"): "babyes/sleep/add",
    vol.Required("start"): str,
    vol.Required("end"): str,
    vol.Optional("note", default=""): str,
})
@websocket_api.async_response
async def ws_sleep_add(hass, connection, msg):
    await _run(hass, connection, msg, lambda d: d.add_sleep(msg["start"], msg["end"], msg.get("note", "")))


@websocket_api.websocket_command({
    vol.Required("type"): "babyes/sleep/update",
    vol.Required("entry_id"): str,
    vol.Required("start"): str,
    vol.Optional("end"): vol.Any(str, None),
    vol.Optional("note", default=""): str,
    vol.Optional("expected_updated_at"): str,
})
@websocket_api.async_response
async def ws_sleep_update(hass, connection, msg):
    await _run(hass, connection, msg, lambda d: d.update_sleep(
        msg["entry_id"], msg["start"], msg.get("end"), msg.get("note", ""), msg.get("expected_updated_at")))


@websocket_api.websocket_command({vol.Required("type"): "babyes/sleep/delete", vol.Required("entry_id"): str})
@websocket_api.async_response
async def ws_sleep_delete(hass, connection, msg):
    async def act(d):
        await d.delete_sleep(msg["entry_id"])
        return {"deleted": True}
    await _run(hass, connection, msg, act)


@websocket_api.websocket_command({
    vol.Required("type"): "babyes/feed/add",
    vol.Required("breast_milk_ml"): int,
    vol.Required("formula_ml"): int,
    vol.Optional("timestamp"): str,
    vol.Optional("note", default=""): str,
})
@websocket_api.async_response
async def ws_feed_add(hass, connection, msg):
    await _run(hass, connection, msg, lambda d: d.add_feed(
        msg["breast_milk_ml"], msg["formula_ml"], msg.get("timestamp"), msg.get("note", "")))


@websocket_api.websocket_command({
    vol.Required("type"): "babyes/feed/update",
    vol.Required("entry_id"): str,
    vol.Required("breast_milk_ml"): int,
    vol.Required("formula_ml"): int,
    vol.Required("timestamp"): str,
    vol.Optional("note", default=""): str,
    vol.Optional("expected_updated_at"): str,
})
@websocket_api.async_response
async def ws_feed_update(hass, connection, msg):
    await _run(hass, connection, msg, lambda d: d.update_feed(
        msg["entry_id"], msg["breast_milk_ml"], msg["formula_ml"], msg["timestamp"],
        msg.get("note", ""), msg.get("expected_updated_at")))


@websocket_api.websocket_command({vol.Required("type"): "babyes/feed/delete", vol.Required("entry_id"): str})
@websocket_api.async_response
async def ws_feed_delete(hass, connection, msg):
    async def act(d):
        await d.delete_feed(msg["entry_id"])
        return {"deleted": True}
    await _run(hass, connection, msg, act)


@callback
def async_register_websocket(hass: HomeAssistant) -> None:
    for command in (ws_list, ws_subscribe, ws_sleep_start, ws_sleep_stop, ws_sleep_add, ws_sleep_update,
                    ws_sleep_delete, ws_feed_add, ws_feed_update, ws_feed_delete):
        websocket_api.async_register_command(hass, command)
