"""Services for automations, scripts and voice: babyes.start_sleep etc."""
from __future__ import annotations

try:
    import probatio as vol  # Home Assistant 2026+
except ImportError:
    import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.util import dt as dt_util

from .const import DOMAIN, MAX_FEED_NOTE, MAX_ML
from .migration import async_import_legacy
from .runtime import get_runtime
from .store import DiaryError, iso


def _diary(hass):
    runtime = get_runtime(hass)
    if runtime is None:
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_ready")
    return runtime["diary"]


def _fail(err: DiaryError):
    return ServiceValidationError(str(err), translation_domain=DOMAIN, translation_key=err.code,
                                  translation_placeholders=err.placeholders)


def _time(value):
    # Times without a zone are read as Home Assistant's local time.
    return iso(dt_util.as_utc(value)) if value is not None else None


@callback
def async_register_services(hass: HomeAssistant) -> None:
    async def start_sleep(call: ServiceCall):
        try:
            await _diary(hass).start_sleep(_time(call.data.get("start")))
        except DiaryError as err:
            raise _fail(err) from err

    async def stop_sleep(call: ServiceCall):
        try:
            await _diary(hass).stop_sleep()
        except DiaryError as err:
            raise _fail(err) from err

    async def add_feed(call: ServiceCall):
        try:
            await _diary(hass).add_feed(call.data.get("breast_milk_ml", 0), call.data.get("formula_ml", 0),
                                        _time(call.data.get("timestamp")), call.data.get("note", ""))
        except DiaryError as err:
            raise _fail(err) from err

    async def import_history(call: ServiceCall):
        result = await async_import_legacy(hass, _diary(hass), "service")
        return {k: v for k, v in result.items() if k != "at"}

    hass.services.async_register(DOMAIN, "start_sleep", start_sleep,
                                 vol.Schema({vol.Optional("start"): cv.datetime}))
    hass.services.async_register(DOMAIN, "stop_sleep", stop_sleep, vol.Schema({}))
    hass.services.async_register(DOMAIN, "add_feed", add_feed, vol.Schema({
        vol.Optional("breast_milk_ml", default=0): vol.All(vol.Coerce(int), vol.Range(min=0, max=MAX_ML)),
        vol.Optional("formula_ml", default=0): vol.All(vol.Coerce(int), vol.Range(min=0, max=MAX_ML)),
        vol.Optional("timestamp"): cv.datetime,
        vol.Optional("note", default=""): vol.All(str, vol.Length(max=MAX_FEED_NOTE)),
    }))
    hass.services.async_register(DOMAIN, "import_history", import_history, vol.Schema({}),
                                 supports_response=SupportsResponse.OPTIONAL)
