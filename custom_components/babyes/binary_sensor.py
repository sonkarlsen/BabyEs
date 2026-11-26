"""binary_sensor: is the baby asleep right now."""
from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity

from .entity import BabyEsEntity
from .runtime import get_runtime


async def async_setup_entry(hass, entry, async_add_entities) -> None:
    async_add_entities([SleepingSensor(get_runtime(hass), "sleeping")])


class SleepingSensor(BabyEsEntity, BinarySensorEntity):
    @property
    def is_on(self) -> bool:
        return self._diary.ongoing() is not None

    @property
    def extra_state_attributes(self):
        current = self._diary.ongoing()
        return {"started_at": current["start"] if current else None}
