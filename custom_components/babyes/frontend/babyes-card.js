/* BabyEs Card
 * Sleep and bottle diary card for Home Assistant. Served by the BabyEs
 * integration itself, so no dashboard resource is needed.
 *
 * Talks only to the BabyEs WebSocket API (babyes/*). Stores nothing itself,
 * except whether the timeline is shown (localStorage, per device).
 * "Undo" only deletes the single entry this card created seconds earlier.
 * Language, 12/24-hour clock and colours follow the user's Home Assistant
 * profile and theme.
 *
 *   type: custom:babyes-card
 *   name: Baby   # optional, defaults to the name set in the integration
 *   step: 5      # ml per tap, optional
 */
(() => {
  "use strict";
  const TAG = "babyes-card";
  const VERSION = "0.3.0";
  if (customElements.get(TAG)) return;

  /* ---------- language ---------- */
  const TEXT = {
    nb: {
      asleep: "{name} sover", awake: "{name} er våken", since: "siden {t}", loading: "Henter …",
      asleepShort: "Sover", awakeShort: "Våken", sinceClock: "Siden kl. {t}", sleepWord: "søvn",
      period1Today: "1 periode i dag", periodsToday: "{n} perioder i dag", noSleepToday: "Ingen søvn i dag",
      lastAt: "Siste kl. {t}", noBottleToday: "Ingen flasker i dag",
      showTimeline: "Vis tidslinje", hideTimeline: "Skjul tidslinje",
      confirmStopTitle: "Stoppe søvn?", confirmStopText: "{name} har sovet i {d}, siden kl. {t}. Søvnen avsluttes nå.",
      timelineAria: "Døgnet i dag: søvn og flasker", legendSleep: "Søvn", legendFeed: "Flaske",
      loadFailed: "Kunne ikke hente data", noSleepYet: "Ingen søvn registrert ennå",
      startSleep: "Start søvn", stopSleep: "Stopp søvn", newBottle: "Ny flaske",
      lastBottle: "Siste flaske", today: "I dag", noneYet: "Ingen ennå", mlAt: "{ml} ml kl. {t}",
      historyAria: "Historikk og grafer. Siste flaske {last}. I dag {ml} ml og {sleep} søvn",
      undo: "Angre", retry: "Prøv igjen", undone: "Angret", dismiss: "Lukk varselet",
      changeStart: "Endre", changeStartAria: "Endre når søvnen startet", adjustTitle: "Når sovnet {name}?",
      adjustText: "Søvnen ble registrert kl. {t}. Velg når {name} faktisk sovnet.", minEarlier: "−{n} min",
      startAt: "Sovnet kl.", saveStart: "Lagre, sovnet kl. {t}", startChanged: "Søvnen startet kl. {t}",
      typeAmount: "{label} i ml. Skriv inn mengden.",
      sleepStarted: "Søvn startet {t}", sleepStopped: "Søvn stoppet {t}", mlSaved: "{ml} ml er lagret",
      feedChanged: "Flasken er endret", sleepAdded: "Søvn er lagt til", sleepChanged: "Søvnen er endret",
      feedDeleted: "Flasken er slettet", sleepDeleted: "Søvnperioden er slettet",
      editBottle: "Rediger flaske", addSleep: "Legg til søvn", editSleep: "Rediger søvn",
      back: "Tilbake", close: "Lukk", sameAsLast: "Som sist: {b} + {f} ml",
      breast: "Brystmelk", formula: "MME", less: "{step} ml mindre {label}", more: "{step} ml mer {label}",
      time: "Tidspunkt", now: "Nå", earlier: "Tidligere", noteOpt: "Notat (valgfritt)",
      feedNotePh: "F.eks. drakk alt", sleepNotePh: "F.eks. i vogna",
      chooseAmount: "Velg mengde", save: "Lagre {ml} ml", saveChangeMl: "Lagre endring, {ml} ml",
      fellAsleep: "Sovnet", wokeUp: "Våknet", emptyStill: " (tomt = sover fortsatt)",
      noOverlap: "Perioder kan ikke overlappe hverandre.", saveChange: "Lagre endring",
      delete: "Slett", cancel: "Avbryt", yesDelete: "Ja, slett",
      confirmFeed: "Vil du slette denne flasken for godt? Dette kan ikke angres.",
      confirmSleep: "Vil du slette denne søvnperioden for godt? Dette kan ikke angres.",
      history: "Historikk", tabSleep: "Søvn", tabFeed: "Flaske", todayLong: "I dag, {d}",
      prevDay: "Forrige dag", nextDay: "Neste dag", slept: "Sovet",
      period1: "1 periode", periods: "{n} perioder", week: "Uka", ongoing: "Pågår", noNote: "Uten notat",
      nowWord: "nå", editSleepAria: "Rediger søvn {a} til {b}",
      noSleepDay: "Ingen søvn registrert denne dagen.", addPastSleep: "Legg til søvn som er over",
      total: "Totalt", bottle1: "1 flaske", bottles: "{n} flasker", last7: "Siste 7 dager",
      vsPrev: "{p} % fra uka før", barAria: "{d}: {b} ml brystmelk, {f} ml MME",
      editFeedAria: "Rediger flaske kl. {t}", feedLine: "{b} brystmelk, {f} MME",
      noFeedDay: "Ingen flasker registrert denne dagen.",
      dialToday: "Søvn i dag på døgnet", dialSleep: "Søvnperioder på døgnet", dialFeed: "Flasker på døgnet",
      pickAmount: "Velg en mengde.", validTime: "Velg et gyldig tidspunkt.", chooseStart: "Velg når søvnen startet.",
      validWake: "Velg et gyldig tidspunkt for oppvåkning.", chooseWake: "Velg når søvnen sluttet.",
      wakeAfter: "Våknet må være etter sovnet.", noConn: "Ingen tilkobling til Home Assistant.",
      unknownErr: "Ukjent feil",
      notSetup: "BabyEs er ikke satt opp. Legg den til under Innstillinger → Enheter og tjenester.",
      h: "t", min: "min", cfgName: "Navn (valgfritt)", cfgStep: "Steg per trykk",
      cardDesc: "Søvn og flaske i ett kort: start/stopp søvn, ny flaske, historikk og grafer.",
      err_invalid_time: "Ugyldig dato eller klokkeslett.", err_no_timezone: "Tidspunktet må ha tidssone.",
      err_time_required: "Dato og klokkeslett må fylles ut.",
      err_feed_future: "En flaske kan ikke være mer enn én time frem i tid.",
      err_sleep_future: "Søvn kan ikke starte eller slutte i fremtiden.",
      err_end_before_start: "Våknet må være etter sovnet.",
      err_too_long: "En søvnperiode kan ikke være lengre enn 48 timer.",
      err_ongoing_too_old: "En pågående søvn kan ikke ha startet for mer enn 48 timer siden.",
      err_end_required: "Velg når søvnen sluttet.", err_cannot_reopen: "En avsluttet søvnperiode må ha sluttid.",
      err_overlap: "Perioden overlapper en annen søvnperiode.", err_already_sleeping: "En søvn pågår allerede.",
      err_not_sleeping: "Det er ingen pågående søvn å stoppe.",
      err_amount_invalid: "Mengder må være hele tall mellom 0 og 1000 ml.", err_amount_zero: "Registrer minst 1 ml.",
      err_note_too_long: "Notatet er for langt.", err_not_found: "Fant ikke registreringen. Last inn historikken på nytt.",
      err_conflict: "Registreringen er endret på en annen enhet. Åpne den på nytt.",
      err_not_ready: "BabyEs er ikke satt opp eller laster fortsatt.",
      err_storage_error: "Kunne ikke lagre. Prøv igjen.",
    },
    en: {
      asleep: "{name} is asleep", awake: "{name} is awake", since: "since {t}", loading: "Loading …",
      asleepShort: "Asleep", awakeShort: "Awake", sinceClock: "Since {t}", sleepWord: "sleep",
      period1Today: "1 period today", periodsToday: "{n} periods today", noSleepToday: "No sleep today",
      lastAt: "Last at {t}", noBottleToday: "No bottles today",
      showTimeline: "Show timeline", hideTimeline: "Hide timeline",
      confirmStopTitle: "Stop sleep?", confirmStopText: "{name} has slept for {d}, since {t}. The sleep ends now.",
      timelineAria: "Today on a 24-hour line: sleep and bottles", legendSleep: "Sleep", legendFeed: "Bottle",
      loadFailed: "Could not load data", noSleepYet: "No sleep registered yet",
      startSleep: "Start sleep", stopSleep: "Stop sleep", newBottle: "New bottle",
      lastBottle: "Last bottle", today: "Today", noneYet: "None yet", mlAt: "{ml} ml at {t}",
      historyAria: "History and charts. Last bottle {last}. Today {ml} ml and {sleep} of sleep",
      undo: "Undo", retry: "Try again", undone: "Undone", dismiss: "Dismiss",
      changeStart: "Change", changeStartAria: "Change when the sleep started", adjustTitle: "When did {name} fall asleep?",
      adjustText: "The sleep was registered at {t}. Choose when {name} actually fell asleep.", minEarlier: "−{n} min",
      startAt: "Fell asleep at", saveStart: "Save, asleep at {t}", startChanged: "Sleep started at {t}",
      typeAmount: "{label} in ml. Type the amount.",
      sleepStarted: "Sleep started {t}", sleepStopped: "Sleep stopped {t}", mlSaved: "{ml} ml saved",
      feedChanged: "Bottle updated", sleepAdded: "Sleep added", sleepChanged: "Sleep updated",
      feedDeleted: "Bottle deleted", sleepDeleted: "Sleep period deleted",
      editBottle: "Edit bottle", addSleep: "Add sleep", editSleep: "Edit sleep",
      back: "Back", close: "Close", sameAsLast: "Same as last: {b} + {f} ml",
      breast: "Breast milk", formula: "Formula", less: "{step} ml less {label}", more: "{step} ml more {label}",
      time: "Time", now: "Now", earlier: "Earlier", noteOpt: "Note (optional)",
      feedNotePh: "E.g. finished it", sleepNotePh: "E.g. in the pram",
      chooseAmount: "Choose amount", save: "Save {ml} ml", saveChangeMl: "Save change, {ml} ml",
      fellAsleep: "Fell asleep", wokeUp: "Woke up", emptyStill: " (empty = still asleep)",
      noOverlap: "Periods cannot overlap.", saveChange: "Save change",
      delete: "Delete", cancel: "Cancel", yesDelete: "Yes, delete",
      confirmFeed: "Delete this bottle permanently? This cannot be undone.",
      confirmSleep: "Delete this sleep period permanently? This cannot be undone.",
      history: "History", tabSleep: "Sleep", tabFeed: "Bottles", todayLong: "Today, {d}",
      prevDay: "Previous day", nextDay: "Next day", slept: "Slept",
      period1: "1 period", periods: "{n} periods", week: "This week", ongoing: "Ongoing", noNote: "No note",
      nowWord: "now", editSleepAria: "Edit sleep {a} to {b}",
      noSleepDay: "No sleep registered this day.", addPastSleep: "Add a finished sleep",
      total: "Total", bottle1: "1 bottle", bottles: "{n} bottles", last7: "Last 7 days",
      vsPrev: "{p} % vs. the week before", barAria: "{d}: {b} ml breast milk, {f} ml formula",
      editFeedAria: "Edit bottle at {t}", feedLine: "{b} breast milk, {f} formula",
      noFeedDay: "No bottles registered this day.",
      dialToday: "Sleep today on a 24-hour clock", dialSleep: "Sleep periods on a 24-hour clock", dialFeed: "Bottles on a 24-hour clock",
      pickAmount: "Choose an amount.", validTime: "Choose a valid time.", chooseStart: "Choose when the sleep started.",
      validWake: "Choose a valid wake-up time.", chooseWake: "Choose when the sleep ended.",
      wakeAfter: "Wake-up must be after falling asleep.", noConn: "No connection to Home Assistant.",
      unknownErr: "Unknown error",
      notSetup: "BabyEs is not set up. Add it under Settings → Devices & services.",
      h: "h", min: "min", cfgName: "Name (optional)", cfgStep: "Step per tap",
      cardDesc: "Sleep and bottles in one card: start/stop sleep, new bottle, history and charts.",
      err_invalid_time: "Invalid date or time.", err_no_timezone: "The time must include a time zone.",
      err_time_required: "Date and time are required.",
      err_feed_future: "A bottle cannot be more than one hour in the future.",
      err_sleep_future: "Sleep cannot start or end in the future.",
      err_end_before_start: "Wake-up must be after falling asleep.",
      err_too_long: "A single sleep period cannot exceed 48 hours.",
      err_ongoing_too_old: "An ongoing sleep cannot have started more than 48 hours ago.",
      err_end_required: "Choose when the sleep ended.", err_cannot_reopen: "A finished sleep period must keep its end time.",
      err_overlap: "The period overlaps another sleep period.", err_already_sleeping: "A sleep is already in progress.",
      err_not_sleeping: "There is no ongoing sleep to stop.",
      err_amount_invalid: "Amounts must be whole numbers between 0 and 1000 ml.", err_amount_zero: "Register at least 1 ml.",
      err_note_too_long: "The note is too long.", err_not_found: "The entry was not found. Reload the history.",
      err_conflict: "The entry was changed on another device. Open it again.",
      err_not_ready: "BabyEs is not set up or still loading.",
      err_storage_error: "Could not save. Try again.",
    },
  };
  let LANG = "nb", LOCALE = "nb-NO", H12 = false;
  const langOf = (hass) => String(hass?.locale?.language || hass?.language || navigator.language || "en").toLowerCase();
  // Changes whenever the user switches language or clock format in their HA profile.
  const localeKey = (hass) => `${langOf(hass)}|${hass?.locale?.time_format || ""}`;
  const pickLang = (hass) => {
    const l = langOf(hass);
    LANG = /^(nb|no|nn)\b/.test(l) ? "nb" : "en";
    LOCALE = LANG === "nb" ? "nb-NO" : l;
    // Same rule as the Home Assistant frontend: the profile's time format wins.
    // "language" follows the HA language, "system" follows the browser/OS.
    const tf = String(hass?.locale?.time_format || "language");
    if (tf === "12") H12 = true;
    else if (tf === "24") H12 = false;
    else {
      try { H12 = new Date(2023, 0, 1, 22).toLocaleString(tf === "system" ? undefined : l).includes("10"); }
      catch (_) { H12 = false; }
    }
  };
  const t = (key, vars = {}) => String(TEXT[LANG][key] ?? TEXT.en[key] ?? key).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

  /* ---------- helpers ---------- */
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const pad = (n) => String(n).padStart(2, "0");
  const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d, 0, 0, 0, 0); };
  const addDays = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return dayKey(d); };
  const mondayOf = (k) => addDays(k, -((fromKey(k).getDay() + 6) % 7));
  const fmt = (d, o) => new Intl.DateTimeFormat(LOCALE, o).format(d);
  const hm = (ms) => fmt(new Date(ms), { hour: H12 ? "numeric" : "2-digit", minute: "2-digit", hourCycle: H12 ? "h12" : "h23" });
  // Short hour marks for the dial and the timeline: "00 06 12 18" or "12a 6a 12p 6p".
  const hourLabel = (h) => (H12 ? `${h % 12 || 12}${h % 24 < 12 ? "a" : "p"}` : pad(h));
  const clock = (min) => { const v = Math.max(0, Math.floor(min)); return `${Math.floor(v / 60)}:${pad(v % 60)}`; };
  const dur = (min) => { const v = Math.max(0, Math.round(min)); const h = Math.floor(v / 60), m = v % 60; return h ? (m ? `${h} ${t("h")} ${m} ${t("min")}` : `${h} ${t("h")}`) : `${m} ${t("min")}`; };
  const localInput = (d) => `${dayKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const errText = (e) => {
    const code = e?.code || e?.error?.code;
    if (code && TEXT.en[`err_${code}`]) return t(`err_${code}`);
    return String(e?.message || e?.error?.message || e?.error || e || t("unknownErr")).slice(0, 240);
  };
  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const clampMl = (v) => Math.max(0, Math.min(1000, Math.round(num(v))));
  const dayStart = (k) => fromKey(k).getTime();
  const dayEnd = (k) => fromKey(addDays(k, 1)).getTime();

  const range = (r, now) => [Date.parse(r.start), r.end ? Date.parse(r.end) : now];
  const minutesIn = (records, a, b, now) => {
    let ms = 0;
    for (const r of records) { const [f, to] = range(r, now); ms += Math.max(0, Math.min(to, b) - Math.max(f, a)); }
    return ms / 60000;
  };
  const segmentsOfDay = (records, k, now) => {
    const a = dayStart(k), b = dayEnd(k), out = [];
    for (const r of records) {
      const [f, to] = range(r, now);
      if (f >= b || to <= a) continue;
      const s = Math.max(f, a), e = Math.min(to, b);
      out.push([(s - a) / 3600000, (e - a) / 3600000, !r.end]);
    }
    return out;
  };

  /* ---------- colours ---------- */
  // Bottles use a theme colour that clearly differs from the sleep colour.
  // accent-color is used when it is different enough; otherwise the most
  // different of the theme's other named colours.
  let paint = null;
  const toRgb = (value) => {
    const s = String(value || "").trim();
    if (!s) return null;
    paint = paint || document.createElement("canvas").getContext("2d");
    paint.fillStyle = "#010203";
    paint.fillStyle = s;
    const out = paint.fillStyle;
    if (out === "#010203") return null; // not a colour the browser understands
    if (out[0] === "#") return [1, 3, 5].map((i) => parseInt(out.slice(i, i + 2), 16));
    const m = out.match(/rgba?\(([^)]+)\)/);
    return m ? m[1].split(",").slice(0, 3).map((x) => Number(x)) : null;
  };
  const hsl = ([r, g, b]) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
    if (!d) return [0, 0, l];
    let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
    return [h, d / (1 - Math.abs(2 * l - 1)), l];
  };
  // 0 = looks the same, 1 = opposite hues (or very different lightness).
  const colourGap = (a, b) => {
    const A = hsl(a), B = hsl(b);
    const dh = Math.abs(A[0] - B[0]) % 360;
    const hue = A[1] > 0.2 && B[1] > 0.2 ? Math.min(dh, 360 - dh) / 180 : 0;
    return Math.max(hue, Math.abs(A[2] - B[2]) * 1.6);
  };
  const FEED_CANDIDATES = ["--accent-color", "--amber-color", "--orange-color", "--yellow-color", "--warning-color",
    "--deep-orange-color", "--blue-color", "--light-blue-color", "--cyan-color", "--teal-color", "--green-color",
    "--indigo-color", "--purple-color", "--pink-color", "--red-color"];
  const pickFeedColour = (el) => {
    const cs = getComputedStyle(el);
    if (cs.getPropertyValue("--babyes-feed-color").trim()) return ""; // the theme chose one explicitly
    const sleep = toRgb(cs.getPropertyValue("--babyes-sleep-color")) || toRgb(cs.getPropertyValue("--primary-color"));
    if (!sleep) return "";
    let best = null;
    FEED_CANDIDATES.forEach((name, i) => {
      const raw = cs.getPropertyValue(name).trim();
      const rgb = toRgb(raw);
      if (!rgb || hsl(rgb)[1] < 0.25) return;
      const gap = colourGap(sleep, rgb);
      const score = i === 0 && gap >= 0.33 ? 9 : gap - i * 0.01; // a clearly different accent always wins
      if (!best || score > best.score) best = { raw, score };
    });
    return best ? best.raw : "";
  };
  // Formula gets its own theme colour, as far as possible from both the
  // breast-milk colour and the sleep colour, so the two never look alike.
  const pickFormulaColour = (el) => {
    const cs = getComputedStyle(el);
    if (cs.getPropertyValue("--babyes-formula-color").trim()) return "";
    const milk = toRgb(cs.getPropertyValue("--be-milk"));
    if (!milk) return "";
    const sleep = toRgb(cs.getPropertyValue("--be-sleep"));
    let best = null;
    FEED_CANDIDATES.forEach((name, i) => {
      const raw = cs.getPropertyValue(name).trim();
      const rgb = toRgb(raw);
      if (!rgb || hsl(rgb)[1] < 0.25) return;
      const gap = Math.min(colourGap(milk, rgb), sleep ? colourGap(sleep, rgb) * 1.15 : 1);
      const score = gap - i * 0.005;
      if (!best || score > best.score) best = { raw, score, gap };
    });
    return best && best.gap >= 0.2 ? best.raw : "";
  };

  /* ---------- 24 h dial ---------- */
  const pt = (c, h, r) => { const a = (h / 24) * Math.PI * 2; return [c + r * Math.sin(a), c - r * Math.cos(a)]; };
  const arc = (c, a, b, r) => {
    if (b - a < 0.05) b = a + 0.05;
    if (b - a > 23.98) b = a + 23.98;
    const p = pt(c, a, r), q = pt(c, b, r);
    return `M${p[0].toFixed(2)} ${p[1].toFixed(2)}A${r} ${r} 0 ${b - a > 12 ? 1 : 0} 1 ${q[0].toFixed(2)} ${q[1].toFixed(2)}`;
  };
  function dial({ size, view = 280, r = 108, width = 20, segs = [], marks = [], hand = null, ticks = true, labels = true, track, segColor, handColor, label }) {
    const c = view / 2;
    let s = `<svg width="${size}" height="${size}" viewBox="0 0 ${view} ${view}" role="img" aria-label="${esc(label)}">`;
    s += `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${track}" stroke-width="${width}"/>`;
    if (ticks) for (let h = 0; h < 24; h++) {
      const major = h % 6 === 0, a = pt(c, h, r - width / 2 - (major ? 16 : 12)), b = pt(c, h, r - width / 2 - 6);
      s += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="var(--be-line)" stroke-width="${major ? 2 : 1.2}" stroke-linecap="round"/>`;
    }
    for (const [a, b, live] of segs) s += `<path d="${arc(c, a, b, r)}" fill="none" stroke="${segColor}" stroke-width="${width}" stroke-linecap="round"${live ? ' opacity=".55"' : ""}/>`;
    for (const m of marks) {
      const L = Math.max(10, m.total / 4), r0 = r - L / 2, rm = r0 + L * (m.total ? m.breast / m.total : 0), r1 = r + L / 2;
      const A = pt(c, m.h, r0), M = pt(c, m.h, rm), B = pt(c, m.h, r1);
      if (m.breast) s += `<line x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${M[0].toFixed(1)}" y2="${M[1].toFixed(1)}" stroke="var(--be-milk)" stroke-width="11" stroke-linecap="round"/>`;
      if (m.formula) s += `<line x1="${M[0].toFixed(1)}" y1="${M[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" stroke="var(--be-formula)" stroke-width="11" stroke-linecap="round"/>`;
    }
    if (hand !== null) {
      const a = pt(c, hand, r - width / 2 - 12), b = pt(c, hand, r + width / 2 + 2);
      s += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${handColor}" stroke-width="${view > 200 ? 3 : 5}" stroke-linecap="round"/>`;
    }
    if (labels) for (const h of [0, 6, 12, 18]) {
      const p = pt(c, h, r + width / 2 + 13);
      s += `<text x="${p[0].toFixed(1)}" y="${p[1].toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="13" fill="var(--be-muted)">${esc(hourLabel(h))}</text>`;
    }
    return s + "</svg>";
  }

  const ICON = {
    stop: "M7 7h10v10H7z",
    moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    close: "M6 6l12 12M18 6 6 18",
    check: "M20 6 9 17l-5-5",
    left: "m15 18-6-6 6-6",
    right: "m9 18 6-6-6-6",
    pencil: "M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z",
    sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4",
    bottle: "M8 2h8M9 2v2.8a4 4 0 0 1-.7 2.2l-.6.9A4 4 0 0 0 7 10.2V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.8a4 4 0 0 0-.7-2.3l-.6-.9A4 4 0 0 1 15 4.8V2M7 15h10",
    down: "m6 9 6 6 6-6",
  };
  const icon = (n, size = 20) => `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON[n]}"/></svg>`;

  /* ---------- styles ---------- */
  const CSS = `
  :host{display:block;
    /* All colours come from the active Home Assistant theme (light and dark).
       babyes-* variables in a theme can override them. */
    --be-card:var(--babyes-card-color,var(--ha-card-background,var(--card-background-color,#fff)));
    --be-ink:var(--primary-text-color,#212121);--be-muted:var(--secondary-text-color,#727272);
    --be-line:var(--divider-color,rgba(0,0,0,.12));
    --be-sleep:var(--babyes-sleep-color,var(--primary-color,#03a9f4));
    /* --be-feed-auto: a theme colour picked in JS to differ clearly from the sleep colour */
    --be-feed:var(--babyes-feed-color,var(--be-feed-auto,var(--accent-color,#ff9800)));
    --be-sleep-ink:color-mix(in srgb,var(--be-sleep) 72%,var(--be-ink));
    --be-feed-ink:color-mix(in srgb,var(--be-feed) 62%,var(--be-ink));
    --be-milk:var(--babyes-milk-color,var(--be-feed));
    /* --be-formula-auto: a second theme colour picked in JS, far from both milk and sleep */
    --be-formula:var(--babyes-formula-color,var(--be-formula-auto,color-mix(in srgb,var(--be-feed) 50%,var(--be-ink))));
    --be-soft:color-mix(in srgb,var(--be-ink) 5%,var(--be-card));
    --be-sheet:var(--primary-background-color,#fafafa);--be-section:var(--be-card);
    --be-field:color-mix(in srgb,var(--be-ink) 7%,var(--be-section));
    --be-accent:var(--primary-color,#03a9f4);--be-on-accent:var(--text-primary-color,#fff);
    --be-ok:color-mix(in srgb,var(--success-color,#43a047) 18%,var(--be-card));--be-ok-ink:var(--be-ink);
    --be-danger:var(--error-color,#db4437);
    font-variant-numeric:tabular-nums}
  *{box-sizing:border-box}
  button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
  button:disabled{cursor:default;opacity:.45}
  button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid var(--be-accent);outline-offset:2px}
  .ico{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
  /* card: background, border, radius and shadow come from ha-card / the theme */
  ha-card.be{overflow:hidden;color:var(--be-ink)}
  .top{padding:12px 14px 0;display:flex;flex-direction:column}
  .slot{margin-top:10px}
  .head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
  .state{display:flex;flex-direction:column;min-width:0}
  .eyebrow{font-size:12px;line-height:16px;letter-spacing:.06em;text-transform:uppercase;font-weight:600;color:var(--be-sleep-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .headline{margin:0;font-size:22px;line-height:1.2;font-weight:600;letter-spacing:-.01em}
  .sub{font-size:14px;color:var(--be-muted)}
  .badge{width:40px;height:40px;flex:none;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--be-sleep) 14%,var(--be-card));color:var(--be-sleep-ink)}
  .strip{width:100%;min-height:48px;display:flex;align-items:center;gap:8px;padding:6px 6px 6px 12px;border:0;border-radius:12px;background:var(--be-soft);text-align:left;transition:background-color .15s ease}
  .strip:hover{background:color-mix(in srgb,var(--be-ink) 8%,var(--be-card))}
  .halves{flex:1;min-width:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
  .half{min-width:0;display:flex;flex-direction:column;gap:2px}
  .half:first-child{padding-right:12px}
  .half+.half{padding-left:12px;border-left:1px solid var(--be-line)}
  .half .v{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .half .v strong{font-weight:600}
  .half .s{font-size:13px;color:var(--be-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .half .s b{color:var(--be-feed-ink);font-weight:600}
  .strip>.ico{color:var(--be-muted)}
  .toast{min-height:48px;display:flex;align-items:center;gap:8px;padding:0 4px 0 14px;border-radius:12px;background:var(--be-ok);color:var(--be-ok-ink);font-size:14px;font-weight:600;animation:be-pop .28s ease}
  .toast.err{background:color-mix(in srgb,var(--be-danger) 16%,var(--be-card))}
  .toast span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .toast button{min-height:40px;padding:0 10px;border:0;border-radius:10px;background:transparent;color:inherit;font-size:14px;font-weight:700;text-decoration:underline;flex:none}
  .toast button:hover{background:color-mix(in srgb,var(--be-ink) 8%,transparent)}
  .toast button.x{width:40px;padding:0;display:grid;place-items:center;text-decoration:none}
  .toast button.x .ico{stroke-width:2.2}
  .tl-toggle{align-self:flex-end;min-height:36px;margin:0 -6px 0 0;padding:0 6px;border:0;border-radius:8px;background:none;color:var(--be-sleep-ink);font-size:13px;font-weight:600;display:flex;align-items:center;gap:2px}
  .tl-toggle .ico{transition:transform .28s ease}
  .tl-toggle[aria-expanded=true] .ico{transform:rotate(180deg)}
  .tl-wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows .34s cubic-bezier(.2,.8,.2,1)}
  .tl-wrap.open{grid-template-rows:1fr}
  .tl-wrap>div{overflow:hidden;min-height:0}
  .tl{display:flex;flex-direction:column;gap:4px;padding:2px 0 4px;opacity:0;transform:translateY(-4px);transition:opacity .2s ease,transform .3s ease}
  .tl-wrap.open .tl{opacity:1;transform:none;transition-delay:.08s}
  .track{position:relative;height:22px;margin:3px 0}
  .track .bg{position:absolute;inset:0;border-radius:8px;background:var(--be-soft);overflow:hidden}
  .track i{position:absolute;top:0;bottom:0;border-radius:6px;background:var(--be-sleep)}
  .track i.live{opacity:.6;border-radius:6px 0 0 6px}
  /* bottle ticks: taller than the track, with a ring in the card colour so they stand out on sleep blocks */
  .track b{position:absolute;top:-4px;bottom:-4px;width:6px;margin-left:-3px;border-radius:3px;background:var(--be-feed);box-shadow:0 0 0 2px var(--be-card)}
  .track u{position:absolute;top:-2px;bottom:-2px;width:2px;margin-left:-1px;border-radius:1px;background:var(--be-ink)}
  .hours{display:flex;justify-content:space-between;font-size:11px;color:var(--be-muted)}
  .legend{display:flex;gap:16px;font-size:13px;color:var(--be-muted)}
  .legend span{display:flex;align-items:center;gap:6px}
  .legend i{width:10px;height:10px;border-radius:3px;background:var(--be-sleep)}
  .legend b{width:6px;height:14px;border-radius:3px;background:var(--be-feed)}
  .actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin-top:4px;border-top:1px solid var(--be-line)}
  .act{min-height:44px;border:0;background:none;display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;font-weight:600;transition:background-color .15s ease}
  .act:hover{background:var(--be-soft)}
  .act:active{background:color-mix(in srgb,var(--be-ink) 9%,var(--be-card))}
  .act.sleep{color:var(--be-sleep-ink)}
  .act.feed{color:var(--be-feed-ink);border-left:1px solid var(--be-line)}
  .msg{font-size:14px;color:var(--be-muted)}
  /* bottom sheet */
  dialog.sheet{position:fixed;inset:auto 0 0 0;margin:0 auto;width:min(560px,100vw);max-width:100vw;max-height:92dvh;padding:0;border:0;border-radius:28px 28px 0 0;background:var(--be-sheet);color:var(--be-ink);overflow:hidden}
  dialog.sheet::backdrop{background:rgba(20,20,24,.45)}
  .sheet-in{display:flex;flex-direction:column;max-height:92dvh}
  .sheet-top{padding:10px 16px 12px;display:flex;flex-direction:column;gap:12px;touch-action:none;cursor:grab}
  .sheet-top button{cursor:pointer}
  dialog.sheet.dragging{animation:none;cursor:grabbing}
  dialog.sheet.dragout::backdrop{animation:be-fade-out .22s ease forwards}
  .grab{align-self:center;width:40px;height:5px;border-radius:3px;background:var(--be-line)}
  .titlebar{display:flex;justify-content:space-between;align-items:center;gap:8px}
  .titlebar h2{margin:0;font-size:22px;font-weight:700}
  .round{width:44px;height:44px;border:0;border-radius:50%;background:var(--be-section);display:grid;place-items:center;flex:none}
  .scroll{overflow-y:auto;overscroll-behavior:contain;padding:0 16px calc(24px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:12px}
  .section{padding:16px;border-radius:24px;background:var(--be-section);display:flex;flex-direction:column;gap:12px}
  .section.bare{background:transparent;padding:0}
  .list{padding:4px 16px}
  .seg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px;padding:4px;border-radius:999px;background:var(--be-field)}
  .seg button{min-height:42px;border:0;border-radius:999px;background:transparent;color:var(--be-muted);font-size:15px;font-weight:600}
  .seg button[aria-selected=true],.seg button[aria-pressed=true]{background:var(--be-section);color:var(--be-ink);box-shadow:0 1px 3px rgba(0,0,0,.12)}
  .seg.inline{display:inline-grid;grid-template-columns:auto auto}
  .seg.inline button{padding:0 16px}
  .nav{display:flex;align-items:center;justify-content:space-between}
  .nav strong{font-size:15px}
  .nav .round{background:transparent}
  .chip{align-self:flex-start;min-height:40px;padding:0 14px;border:1px solid var(--be-line);border-radius:999px;background:transparent;font-size:14px;font-weight:600}
  .stepper{display:flex;align-items:center;gap:8px;padding:6px 6px 6px 18px;border-radius:999px}
  .stepper.milk{background:color-mix(in srgb,var(--be-milk) 18%,var(--be-section))}
  .stepper.formula{background:color-mix(in srgb,var(--be-formula) 20%,var(--be-section))}
  .stepper .name{flex:1;min-width:0;font-size:17px;font-weight:600;display:flex;align-items:center;gap:8px}
  .stepper .name::before{content:"";width:10px;height:10px;border-radius:50%;flex:none;background:var(--be-milk)}
  .stepper.formula .name::before{background:var(--be-formula)}
  .t-milk span::before,.t-formula span::before{content:"";display:inline-block;width:8px;height:8px;margin-right:6px;border-radius:50%;background:var(--be-milk)}
  .t-formula span::before{background:var(--be-formula)}
  .stepper .val{width:96px;display:flex;align-items:baseline;justify-content:center;gap:3px;font-size:24px;font-weight:700}.stepper .val small{font-size:14px;font-weight:500}
  /* the number is a field: tap it to type an amount */
  .stepper .val input{width:3.4ch;min-width:0;padding:2px 0;border:0;border-bottom:2px dashed color-mix(in srgb,var(--be-ink) 28%,transparent);border-radius:0;background:transparent;color:inherit;font:inherit;text-align:center;font-variant-numeric:tabular-nums;cursor:text;-moz-appearance:textfield}
  .stepper .val input:focus{outline:none;border-bottom-style:solid;border-bottom-color:var(--be-accent)}
  .stepper .val input::-webkit-inner-spin-button,.stepper .val input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
  .chips{display:flex;flex-wrap:wrap;gap:8px}
  .chips .chip{align-self:auto}
  .chip[aria-pressed=true]{border-color:var(--be-accent);background:color-mix(in srgb,var(--be-accent) 14%,var(--be-section));color:var(--be-ink)}
  .field input[type=time]{max-width:180px;font-size:20px;font-weight:600}
  .stepper button{width:48px;height:48px;border:0;border-radius:50%;background:var(--be-section);display:grid;place-items:center}
  .row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
  label.field{display:flex;flex-direction:column;gap:6px;font-size:14px;color:var(--be-muted)}
  .field input{min-height:48px;padding:10px 14px;border:1px solid var(--be-line);border-radius:14px;background:var(--be-section);color:var(--be-ink);font:inherit;font-size:16px;width:100%}
  .save{min-height:56px;border:0;border-radius:999px;background:var(--be-accent);color:var(--be-on-accent);font-size:17px;font-weight:700;transition:transform .12s ease}
  .save:active:not(:disabled){transform:scale(.98)}
  .danger{min-height:52px;border:1px solid var(--be-danger);border-radius:999px;background:transparent;color:var(--be-danger);font-size:16px;font-weight:600}
  .ghost{min-height:48px;border:0;border-radius:999px;background:var(--be-field);font-size:15px;font-weight:600}
  .error{padding:12px 14px;border-radius:14px;background:color-mix(in srgb,var(--be-danger) 14%,var(--be-section));color:var(--be-ink);font-size:14px}
  .dialwrap{position:relative;width:220px;height:220px;align-self:center}
  .dialmid{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
  .dialmid span{font-size:13px;color:var(--be-muted)}.dialmid strong{font-size:26px}
  .totals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;text-align:center}
  .totals div{padding:10px 4px;border-radius:16px}.totals span{display:block;font-size:13px;color:var(--be-muted)}.totals strong{font-size:18px}
  .t-milk{background:color-mix(in srgb,var(--be-milk) 18%,var(--be-section))}.t-formula{background:color-mix(in srgb,var(--be-formula) 20%,var(--be-section))}
  .hdr{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.hdr h3{margin:0;font-size:16px;font-weight:700}.hdr span{font-size:14px;color:var(--be-muted)}
  .week{display:grid;grid-template-columns:34px minmax(0,1fr) 74px;align-items:center;gap:8px;min-height:26px}
  .week .d{font-size:13px;color:var(--be-muted)}.week .d.today{color:var(--be-ink);font-weight:700}
  .week .bar{position:relative;height:12px;border-radius:6px;background:var(--be-field);overflow:hidden}
  .week .bar i{position:absolute;top:0;bottom:0;border-radius:6px;background:var(--be-sleep)}
  .week .t{font-size:13px;text-align:right;color:var(--be-muted)}
  .bars{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;align-items:end;height:130px;border-bottom:1px solid var(--be-line)}
  .bars .b{height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:6px}
  .bars .stack{width:min(100%,26px);display:flex;flex-direction:column;border-radius:6px 6px 2px 2px;overflow:hidden}
  .bars .stack i{display:block}
  .bars .lab{font-size:12px;color:var(--be-muted)}.bars .lab.today{color:var(--be-ink);font-weight:700}
  .item{width:100%;min-height:58px;display:flex;align-items:center;gap:10px;padding:0;border:0;border-top:1px solid var(--be-line);background:transparent;text-align:left}
  .item:first-child{border-top:0}
  .item .tm{width:48px;font-size:15px;color:var(--be-muted)}
  .item .main{flex:1;min-width:0;display:flex;flex-direction:column}
  .item .main span{font-size:13px;color:var(--be-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .item .main strong{font-size:16px;font-weight:600}
  .item .dur{font-size:16px;font-weight:600}
  .item .ico{color:var(--be-muted)}
  .add-row{width:100%;min-height:52px;border:0;border-top:1px solid var(--be-line);background:transparent;color:var(--be-sleep-ink);font-size:15px;font-weight:600}
  .empty{padding:18px 4px;text-align:center;font-size:14px;color:var(--be-muted)}
  /* motion: the sheet slides up, its content rises in a short stagger, and it slides down when closed */
  @keyframes be-pop{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  @keyframes be-sheet-in{from{transform:translateY(100%)}to{transform:none}}
  @keyframes be-sheet-out{from{transform:none}to{transform:translateY(100%)}}
  @keyframes be-fade-in{from{opacity:0}to{opacity:1}}
  @keyframes be-fade-out{from{opacity:1}to{opacity:0}}
  @keyframes be-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  @keyframes be-bump{0%{transform:scale(1)}40%{transform:scale(1.14)}100%{transform:scale(1)}}
  dialog.sheet[open]{animation:be-sheet-in .44s cubic-bezier(.32,.72,0,1)}
  dialog.sheet[open]::backdrop{animation:be-fade-in .3s ease}
  dialog.sheet.closing{animation:be-sheet-out .26s cubic-bezier(.4,0,1,1) forwards}
  dialog.sheet.closing::backdrop{animation:be-fade-out .26s ease forwards}
  .intro .scroll>*,.intro .section.bare>*{animation:be-rise .42s cubic-bezier(.2,.8,.2,1) both}
  .intro .scroll>*:nth-child(1),.intro .section.bare>*:nth-child(1){animation-delay:.08s}
  .intro .scroll>*:nth-child(2),.intro .section.bare>*:nth-child(2){animation-delay:.12s}
  .intro .scroll>*:nth-child(3),.intro .section.bare>*:nth-child(3){animation-delay:.16s}
  .intro .section.bare>*:nth-child(4){animation-delay:.2s}
  .intro .section.bare>*:nth-child(n+5){animation-delay:.24s}
  .swap .scroll{animation:be-fade-in .22s ease}
  .stepper .val.bump{animation:be-bump .18s ease}
  @media (prefers-reduced-motion:reduce){*,*::backdrop{animation:none!important;transition:none!important}}
  `;

  class BabyEsCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._config = { name: "", step: 5 };
      this._hass = null;
      this._backendName = "";
      this._sleep = [];
      this._feeds = [];
      this._loaded = false;
      this._loadErr = "";
      this._busy = false;
      this._toast = null;
      this._toastTimer = null;
      this._pane = null;
      this._form = null;
      this._tab = "sleep";
      this._view = dayKey(new Date());
      this._unsub = null;
      this._started = false;
      this._gen = 0;
      this._tick = null;
      this._localeKey = "";
      this._bump = "";
      this._closeTimer = null;
      this._introTimer = null;
      let tl = false;
      try { tl = localStorage.getItem("babyes-card-timeline") === "1"; } catch (_) { /* private mode */ }
      this._timeline = tl;

      this.shadowRoot.innerHTML = `<style>${CSS}</style><div id="card"></div><dialog class="sheet" id="sheet"></dialog>`;
      this._cardEl = this.shadowRoot.getElementById("card");
      this._sheet = this.shadowRoot.getElementById("sheet");
      this.shadowRoot.addEventListener("click", (e) => this._onClick(e));
      this.shadowRoot.addEventListener("input", (e) => this._onInput(e));
      this.shadowRoot.addEventListener("focusin", (e) => this._onFocus(e));
      this.shadowRoot.addEventListener("change", (e) => this._onChange(e));
      // Enter in an amount field closes the keyboard instead of doing nothing.
      this.shadowRoot.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target?.dataset?.ml) e.target.blur(); });
      this._sheet.addEventListener("close", () => {
        clearTimeout(this._closeTimer); clearTimeout(this._introTimer);
        this._sheet.classList.remove("closing", "intro", "swap", "dragging", "dragout");
        this._sheet.style.transform = ""; this._sheet.style.transition = "";
        this._pane = null; this._form = null; this._sheet.innerHTML = "";
      });
      this._initSwipe();
      // Escape and a tap on the dimmed backdrop close with the slide-down animation.
      this._sheet.addEventListener("cancel", (e) => { e.preventDefault(); this._closeSheet(); });
      this._sheet.addEventListener("click", (e) => { if (e.target === this._sheet) this._closeSheet(); });
    }

    // Swipe the sheet down to close it: from the handle and title anywhere,
    // and from the content when it is scrolled to the top.
    _initSwipe() {
      const sheet = this._sheet;
      let d = null;
      const begin = (y, target) => {
        if (!sheet.open || sheet.classList.contains("closing")) return;
        if (target.closest?.("input,textarea,select")) return;
        const scroll = target.closest?.(".scroll");
        d = { y0: y, y: y, t0: performance.now(), scroll, on: false };
      };
      const move = (y, ev) => {
        if (!d) return;
        const dy = y - d.y0;
        d.y = y;
        if (!d.on) {
          if (dy < -6) { d = null; return; } // scrolling up: leave it to the content
          if (dy < 8) return;
          if (d.scroll && d.scroll.scrollTop > 0) { d = null; return; }
          d.on = true;
          d.y0 = y; // start from here, so the sheet does not jump
          d.t0 = performance.now();
          sheet.classList.add("dragging");
          sheet.style.transition = "none";
        }
        if (ev.cancelable) ev.preventDefault();
        sheet.style.transform = `translateY(${Math.max(0, y - d.y0)}px)`;
      };
      const end = () => {
        if (!d) return;
        const g = d; d = null;
        if (!g.on) return;
        this._dragJustEnded = true;
        setTimeout(() => { this._dragJustEnded = false; }, 60);
        const dy = Math.max(0, g.y - g.y0);
        const speed = dy / Math.max(1, performance.now() - g.t0);
        sheet.classList.remove("dragging");
        if (dy > Math.min(140, sheet.offsetHeight * 0.3) || (speed > 0.6 && dy > 30)) {
          sheet.classList.add("dragout");
          sheet.style.transition = "transform .22s cubic-bezier(.4,0,1,1)";
          sheet.style.transform = "translateY(100%)";
          clearTimeout(this._closeTimer);
          this._closeTimer = setTimeout(() => { if (sheet.open) sheet.close(); }, 220);
        } else {
          sheet.style.transition = "transform .3s cubic-bezier(.32,.72,0,1)";
          sheet.style.transform = "";
          setTimeout(() => { if (!sheet.classList.contains("dragout")) sheet.style.transition = ""; }, 320);
        }
      };
      sheet.addEventListener("touchstart", (e) => { if (e.touches.length === 1) begin(e.touches[0].clientY, e.target); else d = null; }, { passive: true });
      sheet.addEventListener("touchmove", (e) => { if (e.touches.length === 1) move(e.touches[0].clientY, e); }, { passive: false });
      sheet.addEventListener("touchend", end);
      sheet.addEventListener("touchcancel", end);
      // Mouse: drag the handle or title bar.
      sheet.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse" || e.button !== 0 || !e.target.closest?.(".sheet-top") || e.target.closest("button")) return;
        begin(e.clientY, e.target);
        const mv = (ev) => move(ev.clientY, ev);
        const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); end(); };
        window.addEventListener("pointermove", mv);
        window.addEventListener("pointerup", up);
      });
      // A drag that ends over the backdrop must not count as a tap on it.
      sheet.addEventListener("click", (e) => { if (this._dragJustEnded) e.stopImmediatePropagation(); }, true);
    }

    static getStubConfig() { return { step: 5 }; }
    static getConfigForm() {
      return {
        schema: [
          { name: "name", selector: { text: {} } },
          { name: "step", selector: { number: { min: 1, max: 50, mode: "box", unit_of_measurement: "ml" } } },
        ],
        computeLabel: (s) => ({ name: t("cfgName"), step: t("cfgStep") })[s.name],
      };
    }
    getCardSize() { return 3; }
    getGridOptions() { return { columns: 12, rows: "auto", min_columns: 6 }; }

    get _name() { return this._config.name || this._backendName || "Baby"; }

    setConfig(config) {
      if (!config || typeof config !== "object") throw new Error("BabyEs: invalid configuration.");
      const step = Math.trunc(num(config.step ?? 5));
      this._config = { name: String(config.name || ""), step: Math.max(1, Math.min(50, step || 5)) };
      this._renderCard();
    }
    set hass(h) {
      this._hass = h;
      // Re-render everything (card and an open sheet) when the user changes
      // language or 12/24-hour format in their Home Assistant profile.
      const key = localeKey(h);
      if (key !== this._localeKey) {
        this._localeKey = key;
        pickLang(h);
        this._renderCard();
        if (this._pane) this._renderSheet();
      }
      // A different theme or light/dark mode can change which bottle colour stands out.
      const themeKey = `${JSON.stringify(h?.selectedTheme ?? "")}|${h?.themes?.theme ?? ""}|${!!h?.themes?.darkMode}`;
      if (themeKey !== this._themeKey) {
        this._themeKey = themeKey;
        // Let Home Assistant apply the new theme variables first.
        clearTimeout(this._themeTimer);
        this._themeTimer = setTimeout(() => this._applyFeedColour(), 60);
      }
      if (this.isConnected) this._start();
    }
    _applyFeedColour() {
      if (!this.isConnected) return;
      const c = pickFeedColour(this);
      if (c !== this._feedColour) {
        this._feedColour = c;
        if (c) this.style.setProperty("--be-feed-auto", c);
        else this.style.removeProperty("--be-feed-auto");
      }
      const f = pickFormulaColour(this);
      if (f === this._formulaColour) return;
      this._formulaColour = f;
      if (f) this.style.setProperty("--be-formula-auto", f);
      else this.style.removeProperty("--be-formula-auto");
    }
    get hass() { return this._hass; }
    connectedCallback() {
      // Several cards share one module-level language; make sure this one is current.
      if (this._hass && localeKey(this._hass) !== this._localeKey) { this._localeKey = localeKey(this._hass); pickLang(this._hass); }
      this._applyFeedColour();
      this._start();
      if (!this._tick) this._tick = setInterval(() => { this._renderCard(); if (this._pane === "history") this._renderSheet(); }, 30000);
      this._renderCard();
    }
    disconnectedCallback() {
      this._gen++;
      clearInterval(this._tick); this._tick = null;
      clearTimeout(this._toastTimer);
      clearTimeout(this._closeTimer);
      clearTimeout(this._introTimer);
      clearTimeout(this._themeTimer);
      if (this._unsub) { try { this._unsub(); } catch (_) { /* gone */ } }
      this._unsub = null;
      this._started = false;
      if (this._sheet.open) this._sheet.close();
    }

    /* ---------- data ---------- */
    async _ws(msg) {
      if (!this._hass) throw new Error(t("noConn"));
      return this._hass.callWS(msg);
    }
    async _reload() {
      try {
        const snap = await this._ws({ type: "babyes/list" });
        this._sleep = Array.isArray(snap?.sleep) ? snap.sleep : [];
        this._feeds = Array.isArray(snap?.feeds) ? snap.feeds : [];
        this._backendName = String(snap?.name || "");
        this._loaded = true;
        this._loadErr = "";
      } catch (e) {
        const code = e?.code || e?.error?.code;
        this._loadErr = code === "unknown_command" || code === "not_ready" ? t("notSetup") : errText(e);
      }
      this._renderCard();
      if (this._pane === "history") this._renderSheet();
    }
    async _start() {
      // Start once per connection; hass updates arrive constantly and must not re-fetch.
      if (!this._hass || this._started) return;
      this._started = true;
      const gen = this._gen;
      await this._reload();
      try {
        const unsub = await this._hass.connection.subscribeMessage(() => { if (gen === this._gen) this._reload(); }, { type: "babyes/subscribe" });
        if (gen !== this._gen) unsub(); else this._unsub = unsub;
      } catch (e) {
        if (!this._loadErr) this._loadErr = errText(e);
        this._renderCard();
      }
    }

    /* ---------- derived ---------- */
    _ongoing() { return this._sleep.find((r) => r.end === null || r.end === undefined) || null; }
    _lastWake() {
      let best = null;
      for (const r of this._sleep) if (r.end) { const v = Date.parse(r.end); if (Number.isFinite(v) && (best === null || v > best)) best = v; }
      return best;
    }
    _lastFeed() {
      let best = null;
      for (const e of this._feeds) { const v = Date.parse(e.timestamp); if (Number.isFinite(v) && (!best || v > best.t)) best = { t: v, e }; }
      return best;
    }
    _feedTotals(k) {
      const out = { breast: 0, formula: 0, total: 0, count: 0 };
      for (const e of this._feeds) {
        if (e.local_date !== k) continue;
        out.breast += num(e.breast_milk_ml); out.formula += num(e.formula_ml);
        out.total += num(e.total_ml ?? num(e.breast_milk_ml) + num(e.formula_ml)); out.count += 1;
      }
      return out;
    }

    /* ---------- card ---------- */
    _renderCard() {
      if (!this._cardEl) return;
      this._applyFeedColour();
      const name = this._name;
      const now = Date.now();
      const today = dayKey(new Date());
      const ready = this._loaded;
      const ongoing = this._ongoing();
      let headline, since;
      if (!ready) { headline = "–"; since = this._loadErr ? t("loadFailed") : t("loading"); }
      else if (ongoing) { const s = Date.parse(ongoing.start); headline = `${t("asleepShort")} · ${dur((now - s) / 60000)}`; since = t("sinceClock", { t: hm(s) }); }
      else {
        const w = this._lastWake();
        headline = w === null ? t("awakeShort") : `${t("awakeShort")} · ${dur((now - w) / 60000)}`;
        since = w === null ? t("noSleepYet") : t("sinceClock", { t: hm(w) });
      }

      const segs = ready ? segmentsOfDay(this._sleep, today, now) : [];
      const last = this._lastFeed();
      const todayFeed = this._feedTotals(today);
      const todaySleep = ready ? minutesIn(this._sleep, dayStart(today), Math.min(dayEnd(today), now), now) : 0;
      const lastToday = last && dayKey(new Date(last.t)) === today;

      // The strip and the toast share one slot, so the card never jumps in height.
      let slot;
      if (this._toast) {
        const ts = this._toast;
        slot = `<div class="toast${ts.error ? " err" : ""}">${icon(ts.error ? "close" : "check", 19)}<span>${esc(ts.text)}</span>`
          + (ts.adjust ? `<button type="button" data-action="adjust-start" aria-label="${esc(t("changeStartAria"))}" ${this._busy ? "disabled" : ""}>${esc(t("changeStart"))}</button>` : "")
          + (ts.undo ? `<button type="button" data-action="undo" ${this._busy ? "disabled" : ""}>${esc(t("undo"))}</button>` : "")
          + `<button type="button" class="x" data-action="dismiss-toast" aria-label="${esc(t("dismiss"))}">${icon("close", 18)}</button></div>`;
      } else if (this._loadErr && !ready) {
        slot = `<div class="toast err">${icon("close", 19)}<span>${esc(this._loadErr)}</span><button type="button" data-action="retry">${esc(t("retry"))}</button></div>`;
      } else {
        const lastTxt = last ? t("mlAt", { ml: num(last.e.total_ml ?? num(last.e.breast_milk_ml) + num(last.e.formula_ml)), t: hm(last.t) }) : t("noneYet");
        const sleepTxt = dur(todaySleep);
        const sleepSub = segs.length === 0 ? t("noSleepToday") : segs.length === 1 ? t("period1Today") : t("periodsToday", { n: segs.length });
        const feedCount = todayFeed.count === 1 ? t("bottle1") : t("bottles", { n: todayFeed.count });
        const feedSub = last ? `${esc(t("lastAt", { t: "\u0000" })).replace("\u0000", `<b>${esc(hm(last.t))}</b>`)}` : esc(t("noBottleToday"));
        slot = `<button type="button" class="strip" data-action="open-history" aria-haspopup="dialog" aria-label="${esc(t("historyAria", { last: lastTxt, ml: todayFeed.total, sleep: sleepTxt }))}" ${!ready ? "disabled" : ""}>
          <span class="halves">
            <span class="half"><span class="v"><strong>${esc(sleepTxt)}</strong> ${esc(t("sleepWord"))}</span><span class="s">${esc(sleepSub)}</span></span>
            <span class="half"><span class="v"><strong>${esc(todayFeed.total)} ml</strong>${todayFeed.count ? ` · ${esc(feedCount)}` : ""}</span><span class="s">${todayFeed.count || lastToday ? feedSub : esc(t("noBottleToday"))}</span></span>
          </span>${icon("right", 18)}</button>`;
      }

      // 24-hour timeline: sleep blocks, a tick per bottle and a "now" line.
      const pct = (h) => Math.max(0, Math.min(100, (h / 24) * 100)).toFixed(2);
      const blocks = segs.map(([a, b, live]) => `<i${live ? ' class="live"' : ""} style="left:${pct(a)}%;width:${Math.max(0.8, ((b - a) / 24) * 100).toFixed(2)}%"></i>`).join("");
      const ticks = ready ? this._feeds.filter((e) => e.local_date === today)
        .map((e) => (Date.parse(e.timestamp) - dayStart(today)) / 3600000).filter((h) => h >= 0 && h < 24)
        .map((h) => `<b style="left:${pct(h)}%"></b>`).join("") : "";
      const nowLine = `<u style="left:${pct((now - dayStart(today)) / 3600000)}%"></u>`;
      const open = this._timeline;
      const timeline = `<div class="tl-wrap${open ? " open" : ""}" id="tl"><div><div class="tl" role="img" aria-label="${esc(t("timelineAria"))}">
          <div class="track"><div class="bg">${blocks}</div>${ticks}${nowLine}</div>
          <div class="hours" aria-hidden="true">${[0, 6, 12, 18, 24].map((h) => `<span>${esc(hourLabel(h))}</span>`).join("")}</div>
          <div class="legend" aria-hidden="true"><span><i></i>${esc(t("legendSleep"))}</span><span><b></b>${esc(t("legendFeed"))}</span></div>
        </div></div></div>`;

      this._cardEl.innerHTML = `<ha-card class="be">
        <div class="top">
          <div class="head"><div class="state"><span class="eyebrow">${esc(name)}</span><h2 class="headline">${esc(headline)}</h2><span class="sub">${esc(since)}</span></div>
            <span class="badge" aria-hidden="true">${icon(ongoing ? "moon" : "sun", 20)}</span></div>
          <div class="slot" role="status" aria-live="polite">${slot}</div>
          <button type="button" class="tl-toggle" data-action="timeline" aria-expanded="${open}" aria-controls="tl" ${!ready ? "disabled" : ""}>${esc(open ? t("hideTimeline") : t("showTimeline"))}${icon("down", 16)}</button>
          ${timeline}
        </div>
        <div class="actions">
          <button type="button" class="act sleep" data-action="toggle-sleep" ${!ready || this._busy ? "disabled" : ""}>${icon(ongoing ? "sun" : "moon", 20)}${esc(ongoing ? t("stopSleep") : t("startSleep"))}</button>
          <button type="button" class="act feed" data-action="open-feed" aria-haspopup="dialog" ${!ready ? "disabled" : ""}>${icon("bottle", 20)}${esc(t("newBottle"))}</button>
        </div>
      </ha-card>`;
    }

    _toggleTimeline() {
      this._timeline = !this._timeline;
      try { localStorage.setItem("babyes-card-timeline", this._timeline ? "1" : "0"); } catch (_) { /* private mode */ }
      // Toggle classes in place (no re-render) so the open/close animates.
      const wrap = this.shadowRoot.getElementById("tl");
      const btn = this.shadowRoot.querySelector(".tl-toggle");
      if (!wrap || !btn) { this._renderCard(); return; }
      wrap.classList.toggle("open", this._timeline);
      btn.setAttribute("aria-expanded", String(this._timeline));
      btn.firstChild.textContent = this._timeline ? t("hideTimeline") : t("showTimeline");
    }

    // Short-lived: 2 s, 4 s when it offers Undo or Change, 8 s for errors. The × closes it at once.
    _showToast(text, undo = null, error = false, adjust = null) {
      clearTimeout(this._toastTimer);
      this._toast = { text, undo, error, adjust };
      this._renderCard();
      const ms = error ? 8000 : undo || adjust ? 4000 : 2000;
      this._toastTimer = setTimeout(() => this._dismissToast(), ms);
    }
    _dismissToast() {
      clearTimeout(this._toastTimer);
      if (!this._toast) return;
      this._toast = null;
      this._renderCard();
    }

    /* ---------- sheet ---------- */
    _openPane(pane, form = null) {
      clearTimeout(this._closeTimer);
      this._sheet.classList.remove("closing");
      this._pane = pane;
      this._form = form;
      this._renderSheet();
      this._animate("intro", 700);
      if (!this._sheet.open) { try { this._sheet.showModal(); } catch (_) { this._sheet.setAttribute("open", ""); } }
    }
    // Plays a one-off sheet animation class (content stagger or tab cross-fade).
    _animate(cls, ms) {
      clearTimeout(this._introTimer);
      this._sheet.classList.remove("intro", "swap");
      void this._sheet.offsetWidth; // restart the animation
      this._sheet.classList.add(cls);
      this._introTimer = setTimeout(() => this._sheet.classList.remove(cls), ms);
    }
    _closeSheet() {
      if (!this._sheet.open || this._sheet.classList.contains("closing")) return;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduce) { this._sheet.close(); return; }
      this._sheet.classList.add("closing");
      this._closeTimer = setTimeout(() => { if (this._sheet.open) this._sheet.close(); }, 260);
    }
    _renderSheet() {
      const p = this._pane;
      if (!p) return;
      let title = "", body = "", top = "";
      if (p === "feed" || p === "edit-feed") { title = p === "feed" ? t("newBottle") : t("editBottle"); body = this._feedForm(); }
      else if (p === "edit-sleep" || p === "add-sleep") { title = p === "add-sleep" ? t("addSleep") : t("editSleep"); body = this._sleepForm(); }
      else if (p === "history") { title = this._name; top = this._historyTop(); body = this._historyBody(); }
      else if (p === "adjust-start") {
        const rec = this._sleep.find((r) => r.id === this._form.id);
        if (!rec || rec.end) { this._closeSheet(); return; } // ended or deleted elsewhere
        title = t("adjustTitle", { name: this._name });
        body = this._adjustForm();
      }
      else if (p === "confirm-stop") {
        const o = this._ongoing();
        if (!o) { this._closeSheet(); return; } // the sleep already ended elsewhere
        const s = Date.parse(o.start);
        title = t("confirmStopTitle");
        body = `<div class="section bare">
          <p class="msg" style="margin:0;font-size:15px;color:var(--be-ink)">${esc(t("confirmStopText", { name: this._name, d: dur((Date.now() - s) / 60000), t: hm(s) }))}</p>
          <div class="row" style="flex-wrap:nowrap"><button type="button" class="ghost" style="flex:1" data-action="close">${esc(t("cancel"))}</button>
          <button type="button" class="save" style="flex:1;min-height:48px;font-size:16px" data-action="confirm-stop" ${this._busy ? "disabled" : ""}>${esc(t("stopSleep"))}</button></div>
        </div>`;
      }
      const back = p === "edit-feed" || p === "edit-sleep" || p === "add-sleep";
      const scrollTop = this._sheet.querySelector(".scroll")?.scrollTop || 0;
      this._sheet.setAttribute("aria-label", title);
      this._sheet.innerHTML = `<div class="sheet-in">
        <div class="sheet-top"><span class="grab" aria-hidden="true"></span>
          <div class="titlebar">${back ? `<button type="button" class="round" data-action="back" aria-label="${esc(t("back"))}">${icon("left")}</button>` : ""}<h2 style="flex:1">${esc(title)}</h2>
          <button type="button" class="round" data-action="close" aria-label="${esc(t("close"))}">${icon("close")}</button></div>${top}</div>
        <div class="scroll">${body}</div></div>`;
      if (p === "history") { const sc = this._sheet.querySelector(".scroll"); if (sc) sc.scrollTop = scrollTop; }
    }

    _feedForm() {
      const f = this._form, step = this._config.step;
      const total = f.breast + f.formula;
      const last = this._lastFeed();
      const isNew = this._pane === "feed";
      const lastChip = isNew && last
        ? `<button type="button" class="chip" data-action="use-last">${esc(t("sameAsLast", { b: num(last.e.breast_milk_ml), f: num(last.e.formula_ml) }))}</button>` : "";
      const stepper = (key, label, cls) => `<div class="stepper ${cls}"><span class="name">${esc(label)}</span>
        <button type="button" data-action="step" data-key="${key}" data-d="-1" aria-label="${esc(t("less", { step, label }))}">${icon("minus")}</button>
        <span class="val${this._bump === key ? " bump" : ""}"><input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" data-ml="${key}" value="${esc(f[key])}" aria-label="${esc(t("typeAmount", { label }))}"><small>ml</small></span>
        <button type="button" data-action="step" data-key="${key}" data-d="1" aria-label="${esc(t("more", { step, label }))}">${icon("plus")}</button></div>`;
      const timeField = `<label class="field">${esc(t("time"))}<input type="datetime-local" data-field="time" value="${esc(f.time)}"></label>`;
      const timeRow = isNew
        ? `<div class="row"><div class="seg inline" role="group" aria-label="${esc(t("time"))}">
             <button type="button" data-action="when" data-v="now" aria-pressed="${f.when === "now"}">${esc(t("now"))}</button>
             <button type="button" data-action="when" data-v="earlier" aria-pressed="${f.when === "earlier"}">${esc(t("earlier"))}</button></div></div>
           ${f.when === "earlier" ? timeField : ""}`
        : timeField;
      const label = total === 0 ? t("chooseAmount") : (isNew ? t("save", { ml: total }) : t("saveChangeMl", { ml: total }));
      return `<div class="section bare">
        ${lastChip}${stepper("breast", t("breast"), "milk")}${stepper("formula", t("formula"), "formula")}
        ${timeRow}
        <label class="field">${esc(t("noteOpt"))}<input type="text" maxlength="250" data-field="note" value="${esc(f.note)}" placeholder="${esc(t("feedNotePh"))}"></label>
        ${f.error ? `<div class="error" role="alert">${esc(f.error)}</div>` : ""}
        <button type="button" class="save" data-action="save-feed" ${total === 0 || this._busy ? "disabled" : ""}>${esc(label)}</button>
        ${isNew ? "" : this._deleteControls("feed")}
      </div>`;
    }

    _sleepForm() {
      const f = this._form;
      const isAdd = this._pane === "add-sleep";
      return `<div class="section bare">
        <label class="field">${esc(t("fellAsleep"))}<input type="datetime-local" data-field="start" value="${esc(f.start)}"></label>
        <label class="field">${esc(t("wokeUp") + (f.ongoing ? t("emptyStill") : ""))}<input type="datetime-local" data-field="end" value="${esc(f.end)}"></label>
        <label class="field">${esc(t("noteOpt"))}<input type="text" maxlength="500" data-field="note" value="${esc(f.note)}" placeholder="${esc(t("sleepNotePh"))}"></label>
        <p class="msg" style="color:var(--be-muted);margin:0">${esc(t("noOverlap"))}</p>
        ${f.error ? `<div class="error" role="alert">${esc(f.error)}</div>` : ""}
        <button type="button" class="save" data-action="save-sleep" ${this._busy ? "disabled" : ""}>${esc(isAdd ? t("addSleep") : t("saveChange"))}</button>
        ${isAdd ? "" : this._deleteControls("sleep")}
      </div>`;
    }

    // Quick fix for a sleep that was started late: pick "−15 min" or type the time.
    _adjustForm() {
      const f = this._form;
      const chosen = this._adjustTarget();
      const chips = [5, 10, 15, 20, 30, 45].map((n) => `<button type="button" class="chip" data-action="adjust-by" data-n="${n}" aria-pressed="${f.by === n}">${esc(t("minEarlier", { n }))}</button>`).join("");
      return `<div class="section bare">
        <p class="msg" style="margin:0;font-size:15px;color:var(--be-ink)">${esc(t("adjustText", { t: hm(f.base), name: this._name }))}</p>
        <div class="chips">${chips}</div>
        <label class="field">${esc(t("startAt"))}<input type="time" data-field="time" data-adjust="1" value="${esc(f.time)}"></label>
        ${f.error ? `<div class="error" role="alert">${esc(f.error)}</div>` : ""}
        <button type="button" class="save" data-action="save-start" ${this._busy || chosen === null ? "disabled" : ""}>${esc(chosen === null ? t("validTime") : t("saveStart", { t: hm(chosen) }))}</button>
      </div>`;
    }
    // The chosen start as a timestamp: that time on the registered day, or the day before if it is still ahead.
    _adjustTarget() {
      const m = /^(\d{1,2}):(\d{2})/.exec(this._form?.time || "");
      if (!m) return null;
      const d = new Date(this._form.base);
      d.setHours(Number(m[1]), Number(m[2]), 0, 0);
      if (d.getTime() > Date.now() + 60000) d.setDate(d.getDate() - 1);
      return d.getTime();
    }
    async _saveStart() {
      const f = this._form;
      const at = this._adjustTarget();
      if (at === null) { f.error = t("validTime"); this._renderSheet(); return; }
      const rec = this._sleep.find((r) => r.id === f.id);
      if (!rec) { this._closeSheet(); return; }
      await this._run(async () => {
        try {
          await this._ws({ type: "babyes/sleep/update", entry_id: rec.id, expected_updated_at: rec.updated_at, start: new Date(at).toISOString(), end: null, note: rec.note || "" });
          this._closeSheet();
          await this._reload();
          this._showToast(t("startChanged", { t: hm(at) }));
        } catch (err) { if (this._form) { this._form.error = errText(err); this._renderSheet(); } else this._showToast(errText(err), null, true); }
      });
    }

    _deleteControls(kind) {
      const f = this._form;
      if (!f.confirmDelete) return `<button type="button" class="danger" data-action="ask-delete">${esc(t("delete"))}</button>`;
      return `<div class="error" role="alert">${esc(kind === "feed" ? t("confirmFeed") : t("confirmSleep"))}</div>
        <div class="row" style="flex-wrap:nowrap"><button type="button" class="ghost" style="flex:1" data-action="cancel-delete">${esc(t("cancel"))}</button>
        <button type="button" class="danger" style="flex:1" data-action="confirm-delete" data-kind="${kind}" ${this._busy ? "disabled" : ""}>${esc(t("yesDelete"))}</button></div>`;
    }

    _historyTop() {
      const today = dayKey(new Date());
      const k = this._view;
      const long = fmt(fromKey(k), { weekday: "long", day: "numeric", month: "long" });
      const label = k === today ? t("todayLong", { d: long }) : long;
      return `<div class="seg" role="tablist" aria-label="${esc(t("history"))}">
          <button type="button" role="tab" data-action="tab" data-v="sleep" aria-selected="${this._tab === "sleep"}">${esc(t("tabSleep"))}</button>
          <button type="button" role="tab" data-action="tab" data-v="feed" aria-selected="${this._tab === "feed"}">${esc(t("tabFeed"))}</button></div>
        <div class="nav"><button type="button" class="round" data-action="day" data-d="-1" aria-label="${esc(t("prevDay"))}">${icon("left")}</button>
          <strong>${esc(label)}</strong>
          <button type="button" class="round" data-action="day" data-d="1" aria-label="${esc(t("nextDay"))}" ${k >= today ? "disabled" : ""}>${icon("right")}</button></div>`;
    }

    _historyBody() { return this._tab === "sleep" ? this._sleepHistory() : this._feedHistory(); }

    _sleepHistory() {
      const now = Date.now(), k = this._view, today = dayKey(new Date());
      const segs = segmentsOfDay(this._sleep, k, now);
      const total = minutesIn(this._sleep, dayStart(k), Math.min(dayEnd(k), now), now);
      const hand = k === today ? (now - dayStart(k)) / 3600000 : null;
      const big = dial({ size: 220, segs, hand, track: "var(--be-field)", segColor: "var(--be-sleep)", handColor: "var(--be-ink)", label: t("dialSleep") });
      const mon = mondayOf(k);
      let weekTotal = 0;
      const rows = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(mon, i);
        const future = d > today;
        const m = future ? 0 : minutesIn(this._sleep, dayStart(d), Math.min(dayEnd(d), now), now);
        weekTotal += m;
        const bars = future ? "" : segmentsOfDay(this._sleep, d, now).map(([a, b]) => `<i style="left:${(a / 24 * 100).toFixed(1)}%;width:${Math.max(0.6, (b - a) / 24 * 100).toFixed(1)}%"></i>`).join("");
        return `<div class="week"><span class="d${d === k ? " today" : ""}">${esc(fmt(fromKey(d), { weekday: "short" }))}</span><span class="bar">${bars}</span><span class="t">${future ? "–" : esc(dur(m))}</span></div>`;
      }).join("");
      const recs = this._sleep.filter((r) => { const [f, to] = range(r, now); return f < dayEnd(k) && to > dayStart(k); })
        .sort((a, b) => String(b.start).localeCompare(String(a.start)));
      const items = recs.map((r) => {
        const s = Date.parse(r.start), e = r.end ? Date.parse(r.end) : null;
        const startTxt = dayKey(new Date(s)) === k ? hm(s) : `${fmt(new Date(s), { weekday: "short" })} ${hm(s)}`;
        const endTxt = e === null ? t("nowWord") : (dayKey(new Date(e)) === k ? hm(e) : `${fmt(new Date(e), { weekday: "short" })} ${hm(e)}`);
        const note = e === null ? t("ongoing") : (r.note || t("noNote"));
        return `<button type="button" class="item" data-action="edit-sleep" data-id="${esc(r.id)}" aria-label="${esc(t("editSleepAria", { a: startTxt, b: endTxt }))}">
          <span class="main"><strong>${esc(startTxt)} – ${esc(endTxt)}</strong><span>${esc(note)}</span></span>
          <span class="dur">${esc(dur(((e ?? now) - s) / 60000))}</span>${icon("pencil", 17)}</button>`;
      }).join("");
      const count = recs.length === 1 ? t("period1") : t("periods", { n: recs.length });
      return `<div class="section"><div class="dialwrap">${big}<div class="dialmid"><span>${esc(t("slept"))}</span><strong>${esc(dur(total))}</strong><span>${esc(count)}</span></div></div></div>
        <div class="section"><div class="hdr"><h3>${esc(t("week"))}</h3><span>${esc(dur(weekTotal))}</span></div>${rows}</div>
        <div class="section list">${items || `<div class="empty">${esc(t("noSleepDay"))}</div>`}
          <button type="button" class="add-row" data-action="add-sleep">${esc(t("addPastSleep"))}</button></div>`;
    }

    _feedHistory() {
      const now = Date.now(), k = this._view, today = dayKey(new Date());
      const dayEntries = this._feeds.filter((e) => e.local_date === k).sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
      const marks = dayEntries.map((e) => {
        const ts = Date.parse(e.timestamp);
        const breast = num(e.breast_milk_ml), formula = num(e.formula_ml);
        return { h: (ts - dayStart(k)) / 3600000, breast, formula, total: breast + formula };
      }).filter((m) => m.h >= 0 && m.h < 24);
      const tot = this._feedTotals(k);
      const hand = k === today ? (now - dayStart(k)) / 3600000 : null;
      const big = dial({ size: 220, marks, hand, track: "var(--be-field)", segColor: "var(--be-milk)", handColor: "var(--be-ink)", label: t("dialFeed") });
      const keys = Array.from({ length: 7 }, (_, i) => addDays(k, i - 6));
      const vals = keys.map((d) => this._feedTotals(d));
      const ceiling = Math.max(1, ...vals.map((v) => v.total));
      const thisSum = vals.reduce((a, v) => a + v.total, 0);
      const prevSum = keys.reduce((a, d) => a + this._feedTotals(addDays(d, -7)).total, 0);
      const cmp = prevSum ? t("vsPrev", { p: `${thisSum >= prevSum ? "+" : ""}${Math.round((thisSum - prevSum) / prevSum * 100)}` }) : "";
      const bars = keys.map((d, i) => {
        const v = vals[i];
        const h = Math.round(v.total / ceiling * 104);
        const bh = v.total ? Math.round(h * v.breast / v.total) : 0;
        const lab = d === today ? t("today") : fmt(fromKey(d), { weekday: "short" });
        return `<div class="b" role="img" aria-label="${esc(t("barAria", { d: lab, b: v.breast, f: v.formula }))}"><span class="stack" style="height:${Math.max(2, h)}px">
          <i style="height:${h - bh}px;background:var(--be-formula)"></i><i style="height:${bh}px;background:var(--be-milk)"></i></span>
          <span class="lab${d === k ? " today" : ""}">${esc(lab)}</span></div>`;
      }).join("");
      const items = dayEntries.map((e) => {
        const ts = Date.parse(e.timestamp);
        const b = num(e.breast_milk_ml), f = num(e.formula_ml);
        return `<button type="button" class="item" data-action="edit-feed" data-id="${esc(e.id)}" aria-label="${esc(t("editFeedAria", { t: hm(ts) }))}">
          <span class="tm">${esc(hm(ts))}</span>
          <span class="main"><strong>${esc(b + f)} ml</strong><span>${esc(t("feedLine", { b, f }))}${e.note ? `. ${esc(e.note)}` : ""}</span></span>${icon("pencil", 17)}</button>`;
      }).join("");
      const count = tot.count === 1 ? t("bottle1") : t("bottles", { n: tot.count });
      return `<div class="section"><div class="dialwrap">${big}<div class="dialmid"><span>${esc(k === today ? t("today") : t("total"))}</span><strong>${esc(tot.total)} ml</strong><span>${esc(count)}</span></div></div>
          <div class="totals"><div class="t-milk"><span>${esc(t("breast"))}</span><strong>${esc(tot.breast)} ml</strong></div><div class="t-formula"><span>${esc(t("formula"))}</span><strong>${esc(tot.formula)} ml</strong></div></div></div>
        <div class="section"><div class="hdr"><h3>${esc(t("last7"))}</h3><span>${esc(cmp)}</span></div><div class="bars">${bars}</div></div>
        <div class="section list">${items || `<div class="empty">${esc(t("noFeedDay"))}</div>`}</div>`;
    }

    /* ---------- events ---------- */
    _onInput(e) {
      const el = e.target;
      if (!this._form) return;
      if (el.dataset?.ml) {
        // Typed amount: digits only, 0–1000 ml. Update the save button in place so the field keeps focus.
        const digits = el.value.replace(/\D/g, "").slice(0, 4);
        if (digits !== el.value) el.value = digits;
        this._form[el.dataset.ml] = clampMl(digits || 0);
        this._form.error = "";
        this._syncFeedSave();
        return;
      }
      if (!el.dataset?.field) return;
      this._form[el.dataset.field] = el.value;
      if (el.dataset.adjust) {
        this._form.by = null;
        this._sheet.querySelectorAll("[data-action=adjust-by]").forEach((b) => b.setAttribute("aria-pressed", "false"));
        const at = this._adjustTarget(), btn = this._sheet.querySelector("[data-action=save-start]");
        if (btn) { btn.disabled = this._busy || at === null; btn.textContent = at === null ? t("validTime") : t("saveStart", { t: hm(at) }); }
      }
    }
    _syncFeedSave() {
      const f = this._form, btn = this._sheet.querySelector("[data-action=save-feed]");
      if (!f || !btn) return;
      const total = f.breast + f.formula;
      btn.disabled = total === 0 || this._busy;
      btn.textContent = total === 0 ? t("chooseAmount") : (this._pane === "feed" ? t("save", { ml: total }) : t("saveChangeMl", { ml: total }));
    }
    // Tapping the number selects it, so typing replaces it.
    _onFocus(e) {
      const el = e.target;
      if (el?.dataset?.ml) setTimeout(() => { try { el.select(); } catch (_) { /* gone */ } }, 0);
    }
    _onChange(e) {
      const el = e.target;
      if (el?.dataset?.ml && this._form) el.value = String(this._form[el.dataset.ml]); // show the clamped value
    }

    async _onClick(e) {
      const el = e.target.closest?.("[data-action]");
      if (!el || el.disabled) return;
      const a = el.dataset.action;
      const step = this._config.step;
      switch (a) {
        case "retry": this._reload(); return;
        // Starting sleep is instant; stopping asks first.
        case "toggle-sleep": return this._ongoing() ? this._openPane("confirm-stop") : this._toggleSleep();
        case "confirm-stop": this._closeSheet(); return this._toggleSleep();
        case "undo": return this._undo();
        case "dismiss-toast": this._dismissToast(); return;
        case "adjust-start": {
          const rec = this._sleep.find((r) => r.id === this._toast?.adjust && !r.end);
          this._dismissToast();
          if (!rec) return;
          const base = Date.parse(rec.start), d = new Date(base);
          return this._openPane("adjust-start", { id: rec.id, base, time: `${pad(d.getHours())}:${pad(d.getMinutes())}`, by: null, error: "" });
        }
        case "adjust-by": {
          const n = Number(el.dataset.n), d = new Date(this._form.base - n * 60000);
          this._form.by = n; this._form.time = `${pad(d.getHours())}:${pad(d.getMinutes())}`; this._form.error = "";
          this._renderSheet(); return;
        }
        case "save-start": return this._saveStart();
        case "open-feed":
          return this._openPane("feed", { breast: 0, formula: 0, when: "now", time: localInput(new Date(Date.now() - 30 * 60000)), note: "", error: "" });
        case "open-history": this._view = dayKey(new Date()); return this._openPane("history");
        case "timeline": return this._toggleTimeline();
        case "close": this._closeSheet(); return;
        case "back": this._form = null; this._pane = "history"; this._renderSheet(); this._animate("swap", 260); return;
        case "use-last": { const l = this._lastFeed(); if (l) { this._form.breast = clampMl(l.e.breast_milk_ml); this._form.formula = clampMl(l.e.formula_ml); this._renderSheet(); } return; }
        case "step": {
          this._form[el.dataset.key] = clampMl(this._form[el.dataset.key] + Number(el.dataset.d) * step);
          this._bump = el.dataset.key; this._renderSheet(); this._bump = "";
          return;
        }
        case "when": this._form.when = el.dataset.v; this._renderSheet(); return;
        case "save-feed": return this._saveFeed();
        case "save-sleep": return this._saveSleep();
        case "tab": if (this._tab !== el.dataset.v) { this._tab = el.dataset.v; this._renderSheet(); this._animate("swap", 260); } return;
        case "day": { const n = addDays(this._view, Number(el.dataset.d)); if (n <= dayKey(new Date())) { this._view = n; this._renderSheet(); this._animate("swap", 260); } return; }
        case "edit-feed": {
          const it = this._feeds.find((x) => x.id === el.dataset.id); if (!it) return;
          return this._openPane("edit-feed", { id: it.id, updated_at: it.updated_at, breast: clampMl(it.breast_milk_ml), formula: clampMl(it.formula_ml), time: localInput(new Date(it.timestamp)), note: it.note || "", error: "", confirmDelete: false });
        }
        case "edit-sleep": {
          const it = this._sleep.find((x) => x.id === el.dataset.id); if (!it) return;
          return this._openPane("edit-sleep", { id: it.id, updated_at: it.updated_at, ongoing: !it.end, start: localInput(new Date(it.start)), end: it.end ? localInput(new Date(it.end)) : "", note: it.note || "", error: "", confirmDelete: false });
        }
        case "add-sleep": {
          const end = new Date(); const start = new Date(end.getTime() - 90 * 60000);
          return this._openPane("add-sleep", { start: localInput(start), end: localInput(end), note: "", error: "" });
        }
        case "ask-delete": this._form.confirmDelete = true; this._renderSheet(); return;
        case "cancel-delete": this._form.confirmDelete = false; this._renderSheet(); return;
        case "confirm-delete": return this._delete(el.dataset.kind);
        default: return;
      }
    }

    async _run(fn) {
      if (this._busy) return null;
      this._busy = true;
      this._renderCard();
      try { return await fn(); }
      finally { this._busy = false; this._renderCard(); }
    }

    async _toggleSleep() {
      const ongoing = this._ongoing();
      await this._run(async () => {
        try {
          if (ongoing) {
            await this._ws({ type: "babyes/sleep/stop" });
            await this._reload();
            this._showToast(t("sleepStopped", { t: hm(Date.now()) }));
          } else {
            const rec = await this._ws({ type: "babyes/sleep/start" });
            await this._reload();
            this._showToast(t("sleepStarted", { t: hm(Date.now()) }), rec?.id ? { kind: "sleep", id: rec.id } : null, false, rec?.id || null);
          }
        } catch (err) { this._showToast(errText(err), null, true); }
      });
    }

    async _undo() {
      const u = this._toast?.undo;
      if (!u) return;
      await this._run(async () => {
        try {
          // Deletes only the single entry created by this card moments ago.
          await this._ws({ type: u.kind === "feed" ? "babyes/feed/delete" : "babyes/sleep/delete", entry_id: u.id });
          await this._reload();
          this._showToast(t("undone"));
        } catch (err) { this._showToast(errText(err), null, true); }
      });
    }

    _feedPayload(f, isNew) {
      const breast = clampMl(f.breast), formula = clampMl(f.formula);
      if (breast + formula === 0) throw new Error(t("pickAmount"));
      let ts;
      if (isNew && f.when === "now") ts = new Date().toISOString();
      else {
        const d = new Date(f.time);
        if (!f.time || Number.isNaN(d.getTime())) throw new Error(t("validTime"));
        ts = d.toISOString();
      }
      return { breast_milk_ml: breast, formula_ml: formula, timestamp: ts, note: String(f.note || "").slice(0, 250) };
    }

    async _saveFeed() {
      const f = this._form, isNew = this._pane === "feed";
      let payload;
      try { payload = this._feedPayload(f, isNew); } catch (err) { f.error = errText(err); this._renderSheet(); return; }
      await this._run(async () => {
        try {
          if (isNew) {
            const rec = await this._ws({ type: "babyes/feed/add", ...payload });
            this._closeSheet();
            await this._reload();
            this._showToast(t("mlSaved", { ml: payload.breast_milk_ml + payload.formula_ml }), rec?.id ? { kind: "feed", id: rec.id } : null);
          } else {
            await this._ws({ type: "babyes/feed/update", entry_id: f.id, expected_updated_at: f.updated_at, ...payload });
            await this._reload();
            this._pane = "history"; this._form = null; this._renderSheet();
            this._showToast(t("feedChanged"));
          }
        } catch (err) { if (this._form) { this._form.error = errText(err); this._renderSheet(); } else this._showToast(errText(err), null, true); }
      });
    }

    async _saveSleep() {
      const f = this._form, isAdd = this._pane === "add-sleep";
      const s = new Date(f.start), e = f.end ? new Date(f.end) : null;
      const fail = (key) => { f.error = t(key); this._renderSheet(); };
      if (!f.start || Number.isNaN(s.getTime())) return fail("chooseStart");
      if (f.end && Number.isNaN(e.getTime())) return fail("validWake");
      if (!e && (isAdd || !f.ongoing)) return fail("chooseWake");
      if (e && e <= s) return fail("wakeAfter");
      await this._run(async () => {
        try {
          const note = String(f.note || "").slice(0, 500);
          if (isAdd) await this._ws({ type: "babyes/sleep/add", start: s.toISOString(), end: e.toISOString(), note });
          else await this._ws({ type: "babyes/sleep/update", entry_id: f.id, expected_updated_at: f.updated_at, start: s.toISOString(), end: e ? e.toISOString() : null, note });
          await this._reload();
          this._pane = "history"; this._form = null; this._renderSheet();
          this._showToast(isAdd ? t("sleepAdded") : t("sleepChanged"));
        } catch (err) { if (this._form) { this._form.error = errText(err); this._renderSheet(); } }
      });
    }

    async _delete(kind) {
      const f = this._form;
      if (!f?.id || !f.confirmDelete) return;
      await this._run(async () => {
        try {
          await this._ws({ type: kind === "feed" ? "babyes/feed/delete" : "babyes/sleep/delete", entry_id: f.id });
          await this._reload();
          this._pane = "history"; this._form = null; this._renderSheet();
          this._showToast(kind === "feed" ? t("feedDeleted") : t("sleepDeleted"));
        } catch (err) { if (this._form) { this._form.error = errText(err); this._renderSheet(); } }
      });
    }
  }

  customElements.define(TAG, BabyEsCard);
  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === TAG)) {
    pickLang({ language: document.documentElement.lang });
    window.customCards.push({ type: TAG, name: "BabyEs", description: t("cardDesc"), preview: false });
  }
  console.info(`%c BABYES CARD %c ${VERSION} `, "background:#3E3A45;color:#F3EEF1;font-weight:bold", "background:#C9AEBC;color:#2A2430");
})();
