"""Sensors for dashboards and automations.

No state_class on totals: a total can go down when a past entry is edited, so
they must not be reported as increasing counters. Exact history comes from the
diary itself (the card reads it directly).
"""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.const import UnitOfTime, UnitOfVolume

from .entity import BabyEsEntity
from .runtime import get_runtime
from .store import Diary, parse, utcnow


def _asleep_for(d: Diary):
    current = d.ongoing()
    return round((utcnow() - parse(current["start"])).total_seconds() / 60) if current else 0


def _awake_for(d: Diary):
    if d.ongoing():
        return None
    woke = d.latest_wake()
    return None if woke is None else max(0, int((utcnow() - woke).total_seconds() // 60))


def _last_feed(d: Diary) -> datetime | None:
    e = d.latest_feed()
    return parse(e["timestamp"]) if e else None


def _last_feed_attrs(d: Diary):
    e = d.latest_feed()
    if not e:
        return None
    return {"breast_milk_ml": e["breast_milk_ml"], "formula_ml": e["formula_ml"],
            "total_ml": e["breast_milk_ml"] + e["formula_ml"]}


@dataclass(frozen=True)
class Spec:
    key: str
    value: Callable[[Diary], object]
    unit: str | None = None
    device_class: SensorDeviceClass | None = None
    icon: str | None = None
    attrs: Callable[[Diary], dict | None] | None = None


MIN, ML = UnitOfTime.MINUTES, UnitOfVolume.MILLILITERS


def _total(key):
    return lambda d: d.feed_totals()[key]


SPECS = (
    Spec("sleep_today", lambda d: d.sleep_today(), MIN, SensorDeviceClass.DURATION, "mdi:sleep"),
    Spec("sleep_week", lambda d: d.sleep_week(), MIN, SensorDeviceClass.DURATION, "mdi:calendar-week"),
    Spec("asleep_for", _asleep_for, MIN, SensorDeviceClass.DURATION, "mdi:timer-outline"),
    Spec("awake_for", _awake_for, MIN, SensorDeviceClass.DURATION, "mdi:weather-sunny"),
    Spec("last_feed", _last_feed, None, SensorDeviceClass.TIMESTAMP, "mdi:baby-bottle", _last_feed_attrs),
    Spec("feed_today", _total("day_total"), ML, None, "mdi:baby-bottle"),
    Spec("feed_today_breast_milk", _total("day_breast"), ML, None, "mdi:water-outline"),
    Spec("feed_today_formula", _total("day_formula"), ML, None, "mdi:baby-bottle-outline"),
    Spec("feeds_today", _total("day_count"), None, None, "mdi:counter"),
    Spec("feed_week", _total("week_total"), ML, None, "mdi:calendar-week"),
    Spec("feeds_week", _total("week_count"), None, None, "mdi:counter"),
)


async def async_setup_entry(hass, entry, async_add_entities) -> None:
    runtime = get_runtime(hass)
    async_add_entities([BabyEsSensor(runtime, spec) for spec in SPECS])


class BabyEsSensor(BabyEsEntity, SensorEntity):
    def __init__(self, runtime: dict, spec: Spec) -> None:
        super().__init__(runtime, spec.key)
        self._spec = spec
        self._attr_native_unit_of_measurement = spec.unit
        self._attr_device_class = spec.device_class
        self._attr_icon = spec.icon
        if spec.unit == MIN:
            self._attr_suggested_display_precision = 0

    @property
    def native_value(self):
        return self._spec.value(self._diary)

    @property
    def extra_state_attributes(self):
        return self._spec.attrs(self._diary) if self._spec.attrs else None
