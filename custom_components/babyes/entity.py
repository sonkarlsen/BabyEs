"""Shared base for BabyEs entities: one device named by the user, translated entity names."""
from __future__ import annotations

from homeassistant.core import callback
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity import Entity

from .const import DOMAIN, VERSION


class BabyEsEntity(Entity):
    _attr_should_poll = False
    _attr_has_entity_name = True

    def __init__(self, runtime: dict, key: str) -> None:
        entry = runtime["entry"]
        self._diary = runtime["diary"]
        self._attr_translation_key = key
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=runtime["name"],
            manufacturer="BabyEs",
            model="Diary",
            sw_version=VERSION,
            entry_type=DeviceEntryType.SERVICE,
        )

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        self.async_on_remove(self._diary.subscribe(self._refresh))

    @callback
    def _refresh(self) -> None:
        self.async_write_ha_state()
