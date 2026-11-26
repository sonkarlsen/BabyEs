"""Access to the loaded diary, shared by the WebSocket API and services."""
from __future__ import annotations

from .const import DOMAIN


def get_runtime(hass) -> dict | None:
    """{'diary': Diary, 'name': str, 'entry': ConfigEntry} or None when not loaded."""
    return hass.data.get(DOMAIN, {}).get("runtime")
