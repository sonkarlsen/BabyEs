"""BabyEs: sleep and bottle diary for Home Assistant.

Data is stored locally in /config/.storage/babyes.diary (included in backups).
Nothing is sent anywhere. See README.md.
"""
from __future__ import annotations

from datetime import timedelta
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.event import async_track_time_change, async_track_time_interval

from .const import CONF_NAME, DEFAULT_NAME, DOMAIN, FRONTEND_URL, LOADER_FILE, VERSION
from .services import async_register_services
from .store import Diary
from .websocket import async_register_websocket

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

    # The loader picks up a new babyes-card.js after a page reload, no restart needed.
    add_extra_js_url(hass, f"{FRONTEND_URL}/{LOADER_FILE}?v={VERSION}")


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    hass.data.setdefault(DOMAIN, {})
    async_register_websocket(hass)
    async_register_services(hass)
    await _register_frontend(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    diary = Diary(hass)
    await diary.async_load()

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
