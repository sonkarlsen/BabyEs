"""BabyEs: sleep and bottle diary for Home Assistant.

Data is stored locally in /config/.storage/babyes.diary (included in backups).
Nothing is sent anywhere. See README.md.
"""
from __future__ import annotations

import logging
from datetime import timedelta
from pathlib import Path

from homeassistant.components import persistent_notification
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.event import async_track_time_change, async_track_time_interval

from .const import CARD_FILE, CONF_IMPORT, CONF_NAME, DEFAULT_NAME, DOMAIN, FRONTEND_URL, VERSION
from .migration import async_import_legacy
from .services import async_register_services
from .store import Diary
from .websocket import async_register_websocket

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.BINARY_SENSOR, Platform.SENSOR]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)



async def _register_frontend(hass: HomeAssistant) -> None:
    """Serve the dashboard card from this integration, so one update covers both."""
    if hass.http is None:
        return
    path = str(Path(__file__).parent / "frontend")
    try:
        from homeassistant.components.http import StaticPathConfig

        await hass.http.async_register_static_paths([StaticPathConfig(FRONTEND_URL, path, False)])
    except ImportError:  # Home Assistant before 2024.7
        hass.http.register_static_path(FRONTEND_URL, path, False)
    from homeassistant.components.frontend import add_extra_js_url

    add_extra_js_url(hass, f"{FRONTEND_URL}/{CARD_FILE}?v={VERSION}")


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    hass.data.setdefault(DOMAIN, {})
    async_register_websocket(hass)
    async_register_services(hass)
    await _register_frontend(hass)
    return True


def _notify_import(hass: HomeAssistant, result: dict) -> None:
    nb = (hass.config.language or "en").split("-")[0] in ("nb", "no", "nn")
    if nb:
        title = "BabyEs: historikk importert"
        msg = (f"Importerte {result['sleep_added']} søvnperioder og {result['feeds_added']} flasker "
               f"fra de tidligere integrasjonene (fant {result['sleep_seen']} og {result['feeds_seen']}). "
               "De gamle dataene er ikke endret.")
        if result.get("skipped"):
            msg += f" Hoppet over uleselige oppføringer: {', '.join(result['skipped'])}."
    else:
        title = "BabyEs: history imported"
        msg = (f"Imported {result['sleep_added']} sleep periods and {result['feeds_added']} bottles "
               f"from the earlier integrations (found {result['sleep_seen']} and {result['feeds_seen']}). "
               "The old data was not changed.")
        if result.get("skipped"):
            msg += f" Skipped unreadable entries: {', '.join(result['skipped'])}."
    persistent_notification.async_create(hass, msg, title=title, notification_id=f"{DOMAIN}_import")


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    diary = Diary(hass)
    await diary.async_load()

    # First start only: copy history from the earlier integrations (read-only).
    if entry.data.get(CONF_IMPORT) and not diary.imports:
        try:
            result = await async_import_legacy(hass, diary, "setup")
        except OSError as err:
            _LOGGER.error("BabyEs could not save imported history: %s", err)
        else:
            if result["sleep_seen"] or result["feeds_seen"]:
                _notify_import(hass, result)

    name = entry.options.get(CONF_NAME) or entry.data.get(CONF_NAME) or DEFAULT_NAME
    hass.data.setdefault(DOMAIN, {})["runtime"] = {"diary": diary, "name": name, "entry": entry}

    @callback
    def _midnight(_now) -> None:
        diary.notify()

    @callback
    def _minute(_now) -> None:
        # Keeps running durations ("asleep for", "awake for") current.
        if diary.sleep:
            diary.notify()

    entry.async_on_unload(async_track_time_change(hass, _midnight, hour=0, minute=0, second=0))
    entry.async_on_unload(async_track_time_interval(hass, _minute, timedelta(minutes=1)))
    entry.async_on_unload(entry.add_update_listener(_reload_on_options))
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def _reload_on_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    if await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data.get(DOMAIN, {}).pop("runtime", None)
        return True
    return False
