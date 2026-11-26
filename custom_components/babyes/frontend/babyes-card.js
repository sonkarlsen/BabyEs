/* BabyEs Card
 * Sleep and bottle diary card for Home Assistant. Served by the BabyEs
 * integration itself, so no dashboard resource is needed.
 *
 * Talks only to the BabyEs WebSocket API (babyes/*). Stores nothing itself.
 * "Undo" only deletes the single entry this card created seconds earlier.
 * Language follows Home Assistant (Norwegian or English).
 *
 *   type: custom:babyes-card
 *   name: Baby   # optional, defaults to the name set in the integration
 *   step: 5      # ml per tap, optional
 */
(() => {
  "use strict";
  const TAG = "babyes-card";
  const VERSION = "0.1.0";
  if (customElements.get(TAG)) return;

  /* ---------- language ---------- */
  const TEXT = {
    nb: {
      asleep: "{name} sover", awake: "{name} er våken", since: "siden {t}", loading: "Henter …",
      loadFailed: "Kunne ikke hente data", noSleepYet: "Ingen søvn registrert ennå",
      startSleep: "Start søvn", stopSleep: "Stopp søvn", newBottle: "Ny flaske",
      lastBottle: "Siste flaske", today: "I dag", noneYet: "Ingen ennå", mlAt: "{ml} ml kl. {t}",
      historyAria: "Historikk og grafer. Siste flaske {last}. I dag {ml} ml og {sleep} søvn",
      undo: "Angre", retry: "Prøv igjen", undone: "Angret",
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
      loadFailed: "Could not load data", noSleepYet: "No sleep registered yet",
      startSleep: "Start sleep", stopSleep: "Stop sleep", newBottle: "New bottle",
      lastBottle: "Last bottle", today: "Today", noneYet: "None yet", mlAt: "{ml} ml at {t}",
      historyAria: "History and charts. Last bottle {last}. Today {ml} ml and {sleep} of sleep",
      undo: "Undo", retry: "Try again", undone: "Undone",
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
  let LANG = "nb", LOCALE = "nb-NO";
  const pickLang = (hass) => {
    const l = String(hass?.locale?.language || hass?.language || navigator.language || "en").toLowerCase();
    LANG = /^(nb|no|nn)\b/.test(l) ? "nb" : "en";
    LOCALE = LANG === "nb" ? "nb-NO" : l;
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
  const hm = (ms) => fmt(new Date(ms), { hour: "2-digit", minute: "2-digit" });
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
    if (labels) for (const [txt, h] of [["00", 0], ["06", 6], ["12", 12], ["18", 18]]) {
      const p = pt(c, h, r + width / 2 + 13);
      s += `<text x="${p[0].toFixed(1)}" y="${p[1].toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="13" fill="var(--be-muted)">${txt}</text>`;
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
  };
  const icon = (n, size = 20) => `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICON[n]}"/></svg>`;

  /* ---------- styles ---------- */
  const CSS = `
  :host{display:block;
    /* light mode: soft blue */
    --be-card:var(--babyes-card-color,#DDE6F0);--be-card-ink:var(--babyes-card-ink,#1F2B3A);--be-card-muted:var(--babyes-card-muted,#56657A);
    --be-card-raise:var(--babyes-card-raise,#C6D4E4);--be-accent:var(--babyes-accent,#5E7898);--be-on-accent:var(--babyes-on-accent,#FFFFFF);
    --be-awake:var(--babyes-awake-color,#2C3B4F);--be-on-awake:var(--babyes-on-awake,#F2F5F9);
    --be-ok:var(--babyes-ok,#CFE0D0);--be-ok-ink:var(--babyes-ok-ink,#2D3D2C);
    --be-save:#3E3A45;--be-save-ink:#F3EEF1;
    --be-sheet:var(--primary-background-color,#F2F1EE);--be-section:var(--card-background-color,#FFFFFF);
    --be-ink:var(--primary-text-color,#24262B);--be-muted:var(--secondary-text-color,#62656C);--be-line:var(--divider-color,#E4E2DD);
    --be-field:color-mix(in srgb,var(--be-ink) 6%,var(--be-section));
    --be-sleep:var(--babyes-sleep-color,#8A6578);--be-milk:var(--babyes-milk-color,#6F87A6);--be-formula:var(--babyes-formula-color,#93A887);
    --be-danger:var(--error-color,#A8453F);
    font-family:var(--ha-font-family-body,var(--primary-font-family,inherit));font-variant-numeric:tabular-nums}
  /* dark mode */
  :host([dark]){
    --be-card:var(--babyes-dark-card-color,#3E3A45);--be-card-ink:var(--babyes-dark-card-ink,#F3EEF1);--be-card-muted:var(--babyes-dark-card-muted,#CDBFC8);
    --be-card-raise:var(--babyes-dark-card-raise,#55505D);--be-accent:var(--babyes-dark-accent,#C9AEBC);--be-on-accent:var(--babyes-dark-on-accent,#2A2430);
    --be-awake:var(--babyes-dark-awake-color,#F3EEF1);--be-on-awake:var(--babyes-dark-on-awake,#2A2430);
    --be-ok:var(--babyes-dark-ok,#4C5A48);--be-ok-ink:var(--babyes-dark-ok-ink,#E5EBDF)}
  *{box-sizing:border-box}
  button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}
  button:disabled{cursor:default;opacity:.45}
  button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid var(--be-accent);outline-offset:2px}
  .ico{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
  ha-card.be{padding:14px;border-radius:var(--ha-card-border-radius,24px);border:0;background:var(--be-card);color:var(--be-card-ink);display:flex;flex-direction:column;gap:12px;box-shadow:none}
  .head{display:flex;justify-content:space-between;align-items:center;gap:12px}
  .state{display:flex;flex-direction:column;min-width:0}
  .label{font-size:14px;color:var(--be-card-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .line{display:flex;align-items:baseline;gap:8px;min-width:0}
  .sub{font-size:13px;color:var(--be-card-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .time{font-size:34px;line-height:1;font-weight:700;letter-spacing:-.02em}
  .actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .btn{min-height:46px;border:0;border-radius:15px;display:flex;align-items:center;justify-content:center;gap:7px;font-size:15px;font-weight:700}
  .btn.primary{background:var(--be-accent);color:var(--be-on-accent)}
  .btn.primary.awake{background:var(--be-awake);color:var(--be-on-awake)}
  .btn.secondary{background:var(--be-card-raise);color:var(--be-card-ink);font-weight:600}
  .status{min-height:42px}
  .stats{width:100%;min-height:42px;display:flex;align-items:center;gap:10px;padding:0 6px 0 12px;border:0;border-radius:14px;background:color-mix(in srgb,var(--be-card-raise) 50%,transparent);color:inherit;text-align:left}
  .stat{flex:1;display:flex;flex-direction:column;min-width:0}
  .stat span{font-size:12px;line-height:1.2;color:var(--be-card-muted)}
  .stat strong{font-size:14px;line-height:1.25;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .stats .ico{color:var(--be-card-muted)}
  .toast{min-height:42px;display:flex;align-items:center;gap:8px;padding:0 4px 0 12px;border-radius:14px;background:var(--be-ok);color:var(--be-ok-ink);font-size:14px;font-weight:600}
  .toast.err{background:color-mix(in srgb,var(--be-danger) 55%,var(--be-card));color:#fff}
  .toast span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .toast button{min-height:36px;padding:0 10px;border:0;border-radius:10px;background:transparent;color:inherit;font-size:14px;font-weight:700;text-decoration:underline}
  .msg{font-size:14px;color:var(--be-card-muted)}
  /* bottom sheet */
  dialog.sheet{position:fixed;inset:auto 0 0 0;margin:0 auto;width:min(560px,100vw);max-width:100vw;max-height:92dvh;padding:0;border:0;border-radius:28px 28px 0 0;background:var(--be-sheet);color:var(--be-ink);overflow:hidden}
  dialog.sheet::backdrop{background:rgba(20,20,24,.45)}
  .sheet-in{display:flex;flex-direction:column;max-height:92dvh}
  .sheet-top{padding:10px 16px 12px;display:flex;flex-direction:column;gap:12px}
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
  .stepper .name{flex:1;font-size:17px;font-weight:600}
  .stepper .val{width:84px;text-align:center;font-size:24px;font-weight:700}.stepper .val small{font-size:14px;font-weight:500}
  .stepper button{width:48px;height:48px;border:0;border-radius:50%;background:var(--be-section);display:grid;place-items:center}
  .row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
  label.field{display:flex;flex-direction:column;gap:6px;font-size:14px;color:var(--be-muted)}
  .field input{min-height:48px;padding:10px 14px;border:1px solid var(--be-line);border-radius:14px;background:var(--be-section);color:var(--be-ink);font:inherit;font-size:16px;width:100%}
  .save{min-height:58px;border:0;border-radius:999px;background:var(--be-save);color:var(--be-save-ink);font-size:18px;font-weight:700}
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
  .add-row{width:100%;min-height:52px;border:0;border-top:1px solid var(--be-line);background:transparent;color:var(--be-sleep);font-size:15px;font-weight:600}
  .empty{padding:18px 4px;text-align:center;font-size:14px;color:var(--be-muted)}
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}
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

      this.shadowRoot.innerHTML = `<style>${CSS}</style><div id="card"></div><dialog class="sheet" id="sheet"></dialog>`;
      this._cardEl = this.shadowRoot.getElementById("card");
      this._sheet = this.shadowRoot.getElementById("sheet");
      this.shadowRoot.addEventListener("click", (e) => this._onClick(e));
      this.shadowRoot.addEventListener("input", (e) => this._onInput(e));
      this._sheet.addEventListener("close", () => { this._pane = null; this._form = null; this._sheet.innerHTML = ""; });
      this._sheet.addEventListener("click", (e) => { if (e.target === this._sheet) this._sheet.close(); });
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
      const firstLang = !this._hass || (h?.locale?.language || h?.language) !== (this._hass?.locale?.language || this._hass?.language);
      this._hass = h;
      if (firstLang) { pickLang(h); this._renderCard(); }
      const dark = !!h?.themes?.darkMode;
      if (dark !== this.hasAttribute("dark")) this.toggleAttribute("dark", dark);
      if (this.isConnected) this._start();
    }
    get hass() { return this._hass; }
    connectedCallback() {
      this._start();
      if (!this._tick) this._tick = setInterval(() => { this._renderCard(); if (this._pane === "history") this._renderSheet(); }, 30000);
      this._renderCard();
    }
    disconnectedCallback() {
      this._gen++;
      clearInterval(this._tick); this._tick = null;
      clearTimeout(this._toastTimer);
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
      const name = this._name;
      const now = Date.now();
      const today = dayKey(new Date());
      const ready = this._loaded;
      const ongoing = this._ongoing();
      let title, time, since;
      if (!ready) { title = name; time = "–"; since = this._loadErr ? t("loadFailed") : t("loading"); }
      else if (ongoing) { const s = Date.parse(ongoing.start); title = t("asleep", { name }); time = clock((now - s) / 60000); since = t("since", { t: hm(s) }); }
      else {
        const w = this._lastWake();
        title = t("awake", { name });
        time = w === null ? "–" : clock((now - w) / 60000);
        since = w === null ? t("noSleepYet") : t("since", { t: hm(w) });
      }
      const segs = ready ? segmentsOfDay(this._sleep, today, now) : [];
      const nowH = (now - dayStart(today)) / 3600000;
      const mini = dial({ size: 56, view: 140, r: 56, width: 16, segs, hand: nowH, ticks: false, labels: false, track: "var(--be-card-raise)", segColor: "var(--be-accent)", handColor: "var(--be-card-ink)", label: t("dialToday") });

      const last = this._lastFeed();
      const todayFeed = this._feedTotals(today);
      const todaySleep = ready ? minutesIn(this._sleep, dayStart(today), Math.min(dayEnd(today), now), now) : 0;
      let status;
      if (this._toast) {
        status = `<div class="toast${this._toast.error ? " err" : ""}">${icon(this._toast.error ? "close" : "check", 19)}<span>${esc(this._toast.text)}</span>${this._toast.undo ? `<button type="button" data-action="undo" ${this._busy ? "disabled" : ""}>${esc(t("undo"))}</button>` : ""}</div>`;
      } else if (this._loadErr && !ready) {
        status = `<div class="toast err">${icon("close", 19)}<span>${esc(this._loadErr)}</span><button type="button" data-action="retry">${esc(t("retry"))}</button></div>`;
      } else {
        const lastTxt = last ? t("mlAt", { ml: num(last.e.total_ml ?? num(last.e.breast_milk_ml) + num(last.e.formula_ml)), t: hm(last.t) }) : t("noneYet");
        const sleepTxt = dur(todaySleep);
        status = `<button type="button" class="stats" data-action="open-history" aria-haspopup="dialog" aria-label="${esc(t("historyAria", { last: lastTxt, ml: todayFeed.total, sleep: sleepTxt }))}" ${!ready ? "disabled" : ""}>
          <span class="stat"><span>${esc(t("lastBottle"))}</span><strong>${esc(lastTxt)}</strong></span>
          <span class="stat"><span>${esc(t("today"))}</span><strong>${esc(todayFeed.total)} ml, ${esc(sleepTxt)}</strong></span>${icon("right", 18)}</button>`;
      }
      this._cardEl.innerHTML = `<ha-card class="be">
        <div class="head"><div class="state"><span class="label">${esc(title)}</span><div class="line"><strong class="time">${esc(time)}</strong><span class="sub">${esc(since)}</span></div></div>${mini}</div>
        <div class="actions">
          <button type="button" class="btn primary${ongoing ? "" : " awake"}" data-action="toggle-sleep" ${!ready || this._busy ? "disabled" : ""}>${icon(ongoing ? "stop" : "moon", 19)}${esc(ongoing ? t("stopSleep") : t("startSleep"))}</button>
          <button type="button" class="btn secondary" data-action="open-feed" aria-haspopup="dialog" ${!ready ? "disabled" : ""}>${icon("plus", 19)}${esc(t("newBottle"))}</button>
        </div>
        <div class="status" role="status" aria-live="polite">${status}</div>
      </ha-card>`;
    }

    _showToast(text, undo = null, error = false) {
      clearTimeout(this._toastTimer);
      this._toast = { text, undo, error };
      this._renderCard();
      this._toastTimer = setTimeout(() => { this._toast = null; this._renderCard(); }, error ? 10000 : 8000);
    }

    /* ---------- sheet ---------- */
    _openPane(pane, form = null) {
      this._pane = pane;
      this._form = form;
      this._renderSheet();
      if (!this._sheet.open) { try { this._sheet.showModal(); } catch (_) { this._sheet.setAttribute("open", ""); } }
    }
    _renderSheet() {
      const p = this._pane;
      if (!p) return;
      let title = "", body = "", top = "";
      if (p === "feed" || p === "edit-feed") { title = p === "feed" ? t("newBottle") : t("editBottle"); body = this._feedForm(); }
      else if (p === "edit-sleep" || p === "add-sleep") { title = p === "add-sleep" ? t("addSleep") : t("editSleep"); body = this._sleepForm(); }
      else if (p === "history") { title = this._name; top = this._historyTop(); body = this._historyBody(); }
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
        <span class="val" aria-live="polite">${esc(f[key])}<small> ml</small></span>
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
      if (!this._form || !el.dataset?.field) return;
      this._form[el.dataset.field] = el.value;
    }

    async _onClick(e) {
      const el = e.target.closest?.("[data-action]");
      if (!el || el.disabled) return;
      const a = el.dataset.action;
      const step = this._config.step;
      switch (a) {
        case "retry": this._reload(); return;
        case "toggle-sleep": return this._toggleSleep();
        case "undo": return this._undo();
        case "open-feed":
          return this._openPane("feed", { breast: 0, formula: 0, when: "now", time: localInput(new Date(Date.now() - 30 * 60000)), note: "", error: "" });
        case "open-history": this._view = dayKey(new Date()); return this._openPane("history");
        case "close": this._sheet.close(); return;
        case "back": this._form = null; this._pane = "history"; this._renderSheet(); return;
        case "use-last": { const l = this._lastFeed(); if (l) { this._form.breast = clampMl(l.e.breast_milk_ml); this._form.formula = clampMl(l.e.formula_ml); this._renderSheet(); } return; }
        case "step": this._form[el.dataset.key] = clampMl(this._form[el.dataset.key] + Number(el.dataset.d) * step); this._renderSheet(); return;
        case "when": this._form.when = el.dataset.v; this._renderSheet(); return;
        case "save-feed": return this._saveFeed();
        case "save-sleep": return this._saveSleep();
        case "tab": this._tab = el.dataset.v; this._renderSheet(); return;
        case "day": { const n = addDays(this._view, Number(el.dataset.d)); if (n <= dayKey(new Date())) { this._view = n; this._renderSheet(); } return; }
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
            this._showToast(t("sleepStarted", { t: hm(Date.now()) }), rec?.id ? { kind: "sleep", id: rec.id } : null);
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
            this._sheet.close();
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
