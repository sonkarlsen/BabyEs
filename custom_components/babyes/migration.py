"""Import history from the two earlier stand-alone integrations.

SAFETY: the legacy storage files are only READ. Nothing here saves, moves or
deletes them, so the old integrations keep working and you can always go back.
Records are copied as-is (same id, times and notes). Records whose id already
exists in BabyEs are skipped, so importing twice never creates duplicates.
"""
from __future__ import annotations

import logging

from homeassistant.helpers.storage import Store

from .const import LEGACY_FEED_KEY, LEGACY_SLEEP_KEY
from .store import Diary, is_feed_record, is_sleep_record

_LOGGER = logging.getLogger(__name__)


async def _read(hass, key: str) -> dict | None:
    try:
        # Reading only. async_save is never called on these Store objects.
        return await Store(hass, 1, key).async_load()
    except Exception as err:  # noqa: BLE001 - a broken legacy file must not stop setup
        _LOGGER.warning("Could not read legacy storage %s: %s", key, err)
        return None


async def async_read_legacy(hass) -> tuple[list[dict], list[dict], list[str]]:
    sleep_raw = (await _read(hass, LEGACY_SLEEP_KEY) or {}).get("records", [])
    feed_raw = (await _read(hass, LEGACY_FEED_KEY) or {}).get("entries", [])
    sleep_raw = sleep_raw if isinstance(sleep_raw, list) else []
    feed_raw = feed_raw if isinstance(feed_raw, list) else []

    fields_s = ("id", "start", "end", "note", "created_at", "updated_at")
    fields_f = ("id", "breast_milk_ml", "formula_ml", "timestamp", "note", "created_at", "updated_at")
    sleep = [{k: r.get(k) for k in fields_s} for r in sleep_raw if is_sleep_record(r)]
    feeds = [{k: e.get(k) for k in fields_f} for e in feed_raw if is_feed_record(e)]
    for rec in (*sleep, *feeds):
        rec["created_at"] = rec["created_at"] or rec.get("start") or rec.get("timestamp")
        rec["updated_at"] = rec["updated_at"] or rec["created_at"]

    skipped = []
    if len(sleep) != len(sleep_raw):
        skipped.append(f"{len(sleep_raw) - len(sleep)} sleep")
    if len(feeds) != len(feed_raw):
        skipped.append(f"{len(feed_raw) - len(feeds)} feed")
    if skipped:
        _LOGGER.warning("Skipped unreadable legacy records: %s", ", ".join(skipped))
    return sleep, feeds, skipped


async def async_import_legacy(hass, diary: Diary, source: str) -> dict:
    sleep, feeds, skipped = await async_read_legacy(hass)
    result = await diary.merge_import(sleep, feeds, source)
    result["skipped"] = skipped
    _LOGGER.info("BabyEs import: %s", result)
    return result
