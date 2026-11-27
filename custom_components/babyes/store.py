"""BabyEssentials diary: sleep periods and bottle feeds in one Home Assistant Store.

The data lives in ``/config/.storage/babyes.diary`` and is part of every Home
Assistant backup. Every write is atomic at diary level: persist first, then
notify listeners. On a storage failure the in-memory state is left unchanged.

Record shapes are identical to the earlier stand-alone integrations, so
imported history keeps ids, timestamps and notes exactly as they were.

    sleep: {id, start, end|None, note, created_at, updated_at}
    feed:  {id, breast_milk_ml, formula_ml, timestamp, note, created_at, updated_at}
"""
from __future__ import annotations

import asyncio
from collections.abc import Callable
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import MAX_FEED_NOTE, MAX_ML, MAX_SLEEP_NOTE, STORAGE_KEY, STORAGE_VERSION

# English fallback texts; the card and HA translations show localized versions.
MESSAGES = {
    "invalid_time": "Invalid date or time.",
    "no_timezone": "The time must include a time zone.",
    "time_required": "Date and time are required.",
    "feed_future": "A bottle cannot be more than one hour in the future.",
    "sleep_future": "Sleep cannot start or end in the future.",
    "end_before_start": "Wake-up must be after falling asleep.",
    "too_long": "A single sleep period cannot exceed 48 hours.",
    "ongoing_too_old": "An ongoing sleep cannot have started more than 48 hours ago.",
    "end_required": "Choose when the sleep ended.",
    "cannot_reopen": "A finished sleep period must keep its end time.",
    "overlap": "The period overlaps another sleep period.",
    "already_sleeping": "A sleep is already in progress.",
    "not_sleeping": "There is no ongoing sleep to stop.",
    "amount_invalid": "Amounts must be whole numbers between 0 and {max} ml.",
    "amount_zero": "Register at least 1 ml.",
    "note_too_long": "The note can be at most {max} characters.",
    "not_found": "The entry was not found. Reload the history.",
    "conflict": "The entry was changed on another device. Open it again.",
    "corrupt": "The diary file has an invalid format. Restore from a backup.",
}


class DiaryError(ValueError):
    """Validation or conflict error carrying a stable, translatable code."""

    def __init__(self, code: str, **placeholders) -> None:
        self.code = code
        self.placeholders = {k: str(v) for k, v in placeholders.items()}
        super().__init__(MESSAGES.get(code, code).format(**placeholders))


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()


def parse(value) -> datetime:
    """Parse an aware ISO-8601 time and convert it to UTC."""
    if not isinstance(value, str) or not value.strip():
        raise DiaryError("time_required")
    try:
        point = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
    except ValueError as err:
        raise DiaryError("invalid_time") from err
    if point.tzinfo is None or point.utcoffset() is None:
        raise DiaryError("no_timezone")
    return point.astimezone(timezone.utc)


def _note(value, limit: int) -> str:
    if value is None:
        value = ""
    if not isinstance(value, str) or len(value) > limit:
        raise DiaryError("note_too_long", max=limit)
    return value.strip()


def validate_sleep(start, end, note) -> dict:
    first = parse(start)
    last = parse(end) if end is not None else None
    now = utcnow()
    if first > now + timedelta(minutes=2):
        raise DiaryError("sleep_future")
    if last is not None:
        if last > now + timedelta(minutes=2):
            raise DiaryError("sleep_future")
        if last <= first:
            raise DiaryError("end_before_start")
        if last - first > timedelta(days=2):
            raise DiaryError("too_long")
    elif now - first > timedelta(days=2):
        raise DiaryError("ongoing_too_old")
    return {"start": iso(first), "end": iso(last) if last else None, "note": _note(note, MAX_SLEEP_NOTE)}


def validate_feed(breast_milk_ml, formula_ml, timestamp, note) -> dict:
    def amount(value) -> int:
        if type(value) is not int or not 0 <= value <= MAX_ML:
            raise DiaryError("amount_invalid", max=MAX_ML)
        return value

    breast, formula = amount(breast_milk_ml), amount(formula_ml)
    if breast + formula == 0:
        raise DiaryError("amount_zero")
    when = parse(timestamp) if timestamp else utcnow()
    if when > utcnow() + timedelta(hours=1):
        raise DiaryError("feed_future")
    return {"breast_milk_ml": breast, "formula_ml": formula, "timestamp": iso(when), "note": _note(note, MAX_FEED_NOTE)}


def _local_date(ts: str) -> str:
    return dt_util.as_local(parse(ts)).date().isoformat()


def is_sleep_record(r) -> bool:
    try:
        return (isinstance(r, dict) and isinstance(r.get("id"), str) and r["id"] != ""
                and parse(r.get("start")) is not None
                and (r.get("end") is None or parse(r["end"]) is not None))
    except DiaryError:
        return False


def is_feed_record(e) -> bool:
    try:
        return (isinstance(e, dict) and isinstance(e.get("id"), str) and e["id"] != ""
                and type(e.get("breast_milk_ml")) is int and type(e.get("formula_ml")) is int
                and parse(e.get("timestamp")) is not None)
    except DiaryError:
        return False


class Diary:
    """One diary, one writer at a time."""

    def __init__(self, hass) -> None:
        self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._lock = asyncio.Lock()
        self.sleep: list[dict] = []
        self.feeds: list[dict] = []
        self.imports: list[dict] = []
        self.revision = 0
        self.loaded_from_disk = False
        self._listeners: set[Callable[[], None]] = set()

    # ---------- persistence ----------
    async def async_load(self) -> None:
        data = await self._store.async_load()
        self.loaded_from_disk = data is not None
        data = data or {}
        sleep, feeds = data.get("sleep", []), data.get("feeds", [])
        if not isinstance(sleep, list) or not isinstance(feeds, list):
            raise DiaryError("corrupt")
        self.sleep, self.feeds = sleep, feeds
        # Log of a one-time import in earlier versions; kept unchanged so no stored data is lost.
        self.imports = data.get("imports", []) if isinstance(data.get("imports"), list) else []
        self.revision = int(data.get("revision", 0))

    async def _commit(self, *, sleep=None, feeds=None, imports=None) -> None:
        sleep = self.sleep if sleep is None else sleep
        feeds = self.feeds if feeds is None else feeds
        imports = self.imports if imports is None else imports
        revision = self.revision + 1
        await self._store.async_save({"sleep": sleep, "feeds": feeds, "imports": imports, "revision": revision})
        self.sleep, self.feeds, self.imports, self.revision = sleep, feeds, imports, revision
        self.notify()

    # ---------- listeners ----------
    def subscribe(self, listener: Callable[[], None]) -> Callable[[], None]:
        self._listeners.add(listener)
        return lambda: self._listeners.discard(listener)

    def notify(self) -> None:
        for listener in tuple(self._listeners):
            listener()

    # ---------- read ----------
    def decorate_feed(self, e: dict) -> dict:
        return {**e, "local_date": _local_date(e["timestamp"]), "total_ml": e["breast_milk_ml"] + e["formula_ml"]}

    def snapshot(self) -> dict:
        sleep = sorted(self.sleep, key=lambda r: r["start"], reverse=True)
        feeds = sorted(self.feeds, key=lambda e: (e["timestamp"], e.get("created_at", "")), reverse=True)
        return {
            "sleep": [dict(r) for r in sleep],
            "feeds": [self.decorate_feed(e) for e in feeds],
            "revision": self.revision,
            "today": dt_util.now().date().isoformat(),
            "timezone": str(dt_util.get_default_time_zone()),
        }

    def ongoing(self) -> dict | None:
        return next((r for r in self.sleep if r.get("end") is None), None)

    def latest_wake(self) -> datetime | None:
        return max((parse(r["end"]) for r in self.sleep if r.get("end")), default=None)

    def latest_feed(self) -> dict | None:
        return max(self.feeds, key=lambda e: e["timestamp"], default=None)

    def sleep_minutes(self, start: datetime, end: datetime) -> int:
        if end <= start:
            return 0
        now, total = utcnow(), 0.0
        for r in self.sleep:
            a, b = parse(r["start"]), parse(r["end"]) if r.get("end") else now
            total += max(0.0, (min(end, b) - max(start, a)).total_seconds())
        return round(total / 60)

    def _day_bounds(self, week: bool = False) -> tuple[datetime, datetime]:
        now = dt_util.now()
        day = now.date() - timedelta(days=now.weekday()) if week else now.date()
        return dt_util.start_of_local_day(day), now

    def sleep_today(self) -> int:
        return self.sleep_minutes(*self._day_bounds())

    def sleep_week(self) -> int:
        return self.sleep_minutes(*self._day_bounds(week=True))

    def feed_totals(self) -> dict[str, int]:
        today = dt_util.now().date()
        monday = today - timedelta(days=today.weekday())
        t = dict.fromkeys(("day_breast", "day_formula", "day_count", "week_breast", "week_formula", "week_count"), 0)
        for e in self.feeds:
            day = dt_util.as_local(parse(e["timestamp"])).date()
            for prefix, hit in (("day", day == today), ("week", monday <= day <= today)):
                if hit:
                    t[f"{prefix}_breast"] += e["breast_milk_ml"]
                    t[f"{prefix}_formula"] += e["formula_ml"]
                    t[f"{prefix}_count"] += 1
        t["day_total"] = t["day_breast"] + t["day_formula"]
        t["week_total"] = t["week_breast"] + t["week_formula"]
        return t

    # ---------- sleep writes ----------
    def _assert_no_overlap(self, proposed: dict, ignore_id: str | None = None) -> None:
        far = datetime.max.replace(tzinfo=timezone.utc)
        start, end = parse(proposed["start"]), parse(proposed["end"]) if proposed["end"] else far
        for other in self.sleep:
            if other["id"] == ignore_id:
                continue
            o_start, o_end = parse(other["start"]), parse(other["end"]) if other.get("end") else far
            if start < o_end and o_start < end:
                raise DiaryError("overlap")

    async def start_sleep(self, start: str | None = None) -> dict:
        fields = validate_sleep(start or iso(utcnow()), None, "")
        async with self._lock:
            if self.ongoing():
                raise DiaryError("already_sleeping")
            self._assert_no_overlap(fields)
            now = iso(utcnow())
            record = {"id": uuid4().hex, **fields, "created_at": now, "updated_at": now}
            await self._commit(sleep=[*self.sleep, record])
            return record

    async def stop_sleep(self) -> dict:
        async with self._lock:
            current = self.ongoing()
            if current is None:
                raise DiaryError("not_sleeping")
            now = iso(utcnow())
            fields = validate_sleep(current["start"], now, current.get("note", ""))
            record = {**current, **fields, "updated_at": now}
            await self._commit(sleep=[record if r["id"] == current["id"] else r for r in self.sleep])
            return record

    async def add_sleep(self, start: str, end: str, note: str = "") -> dict:
        if end is None:
            raise DiaryError("end_required")
        fields = validate_sleep(start, end, note)
        async with self._lock:
            self._assert_no_overlap(fields)
            now = iso(utcnow())
            record = {"id": uuid4().hex, **fields, "created_at": now, "updated_at": now}
            await self._commit(sleep=[*self.sleep, record])
            return record

    async def update_sleep(self, entry_id: str, start: str, end: str | None, note: str = "",
                           expected_updated_at: str | None = None) -> dict:
        fields = validate_sleep(start, end, note)
        async with self._lock:
            old = next((r for r in self.sleep if r["id"] == entry_id), None)
            if old is None:
                raise DiaryError("not_found")
            if expected_updated_at and old.get("updated_at") != expected_updated_at:
                raise DiaryError("conflict")
            if old.get("end") is not None and fields["end"] is None:
                raise DiaryError("cannot_reopen")
            self._assert_no_overlap(fields, ignore_id=entry_id)
            record = {**old, **fields, "updated_at": iso(utcnow())}
            await self._commit(sleep=[record if r["id"] == entry_id else r for r in self.sleep])
            return record

    async def delete_sleep(self, entry_id: str) -> None:
        async with self._lock:
            if not any(r["id"] == entry_id for r in self.sleep):
                raise DiaryError("not_found")
            await self._commit(sleep=[r for r in self.sleep if r["id"] != entry_id])

    # ---------- feed writes ----------
    async def add_feed(self, breast_milk_ml: int, formula_ml: int, timestamp: str | None = None, note: str = "") -> dict:
        fields = validate_feed(breast_milk_ml, formula_ml, timestamp, note)
        now = iso(utcnow())
        entry = {**fields, "id": uuid4().hex, "created_at": now, "updated_at": now}
        async with self._lock:
            await self._commit(feeds=[*self.feeds, entry])
        return self.decorate_feed(entry)

    async def update_feed(self, entry_id: str, breast_milk_ml: int, formula_ml: int, timestamp: str,
                          note: str = "", expected_updated_at: str | None = None) -> dict:
        fields = validate_feed(breast_milk_ml, formula_ml, timestamp, note)
        async with self._lock:
            old = next((e for e in self.feeds if e["id"] == entry_id), None)
            if old is None:
                raise DiaryError("not_found")
            if expected_updated_at and old.get("updated_at") != expected_updated_at:
                raise DiaryError("conflict")
            changed = {**old, **fields, "updated_at": iso(utcnow())}
            await self._commit(feeds=[changed if e["id"] == entry_id else e for e in self.feeds])
        return self.decorate_feed(changed)

    async def delete_feed(self, entry_id: str) -> None:
        async with self._lock:
            if not any(e["id"] == entry_id for e in self.feeds):
                raise DiaryError("not_found")
            await self._commit(feeds=[e for e in self.feeds if e["id"] != entry_id])
