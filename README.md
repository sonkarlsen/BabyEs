# BabyEs

A local sleep and bottle diary for Home Assistant, with a dashboard card.
English and Norwegian (bokmål). [Norsk nedenfor](#norsk).

- Start and stop sleep, register bottles (breast milk and formula), edit and delete entries.
- History with a 24-hour dial, week overview and 7-day charts.
- Entities and services for automations.
- Everything is stored locally in Home Assistant (`/config/.storage/babyes.diary`) and included in backups. Nothing is sent anywhere.

## Install

1. In HACS, open **⋮ → Custom repositories**, add `https://github.com/sonkarlsen/BabyEs` with type **Integration**.
2. Install **BabyEs** and restart Home Assistant.
3. Go to **Settings → Devices & services → Add integration → BabyEs**. Enter a name (shown on the card) and choose whether to import earlier history.

The dashboard card is served by the integration, so no dashboard resource is needed. Add it to a dashboard:

```yaml
type: custom:babyes-card
step: 5        # ml per tap (optional)
name: Baby     # optional, overrides the name from the integration
```

Updates show up in HACS. After updating, restart Home Assistant and reload the dashboard.

## Importing earlier history

If you used the earlier stand-alone sleep tracker (`nordic_sleep_tracker`) or bottle tracker (`mating_tracker`), BabyEs can copy their history on first setup.

- The old storage files are only **read**. They are never changed, moved or deleted, so the old integrations keep working and you can go back at any time.
- Entries keep their id, times and notes. Entries already in BabyEs are skipped, so importing twice never creates duplicates.
- A notification shows how many entries were imported.
- To import again later (for example after using the old cards for a few more days), call the service `babyes.import_history`. It only adds entries that are missing.

Take a full Home Assistant backup before the first import.

## Entities

| Entity | Description |
|---|---|
| `binary_sensor.<name>_sleeping` | On while asleep |
| Sleep today / this week | Minutes |
| Asleep for / awake for | Minutes, current period |
| Last bottle | Time of the last bottle, amounts as attributes |
| Bottles today / this week | ml, plus breast milk and formula today |
| Number of bottles today / this week | Count |

Entity ids depend on the name you choose and your language.

## Services

- `babyes.start_sleep` (optional `start`)
- `babyes.stop_sleep`
- `babyes.add_feed` (`breast_milk_ml`, `formula_ml`, optional `timestamp`, `note`)
- `babyes.import_history`

## Theming

The card follows Home Assistant's light and dark mode. Colours can be overridden with theme variables, for example `babyes-card-color`, `babyes-accent`, `babyes-dark-card-color`, `babyes-sleep-color`, `babyes-milk-color`, `babyes-formula-color`.

## Releasing a new version

1. Bump the version in `custom_components/babyes/manifest.json`, `const.py` (`VERSION`) and `frontend/babyes-card.js` (`VERSION`).
2. Commit and push.
3. Create a GitHub release with the tag `vX.Y.Z`. HACS then offers the update.

---

## Norsk

En lokal dagbok for søvn og flasker i Home Assistant, med eget dashbordkort.

- Start og stopp søvn, registrer flasker (brystmelk og MME), rediger og slett.
- Historikk med døgnur, ukeoversikt og grafer for de siste 7 dagene.
- Entiteter og tjenester til automasjoner.
- Alt lagres lokalt i Home Assistant (`/config/.storage/babyes.diary`) og er med i sikkerhetskopiene. Ingenting sendes noe sted.

### Installering

1. I HACS: **⋮ → Egendefinerte repositorier**, legg til `https://github.com/sonkarlsen/BabyEs` med type **Integrasjon**.
2. Installer **BabyEs** og start Home Assistant på nytt.
3. Gå til **Innstillinger → Enheter og tjenester → Legg til integrasjon → BabyEs**. Skriv inn et navn (vises på kortet) og velg om tidligere historikk skal importeres.

Kortet leveres av integrasjonen, så du trenger ikke legge til en ressurs. Legg det i dashbordet:

```yaml
type: custom:babyes-card
step: 5
```

### Import av tidligere historikk

- De gamle lagringsfilene blir bare **lest**, aldri endret, flyttet eller slettet. De gamle integrasjonene virker fortsatt, og du kan gå tilbake når som helst.
- Registreringene beholder id, tidspunkter og notater. Det som allerede finnes i BabyEs hoppes over, så dobbel import gir aldri duplikater.
- Et varsel viser hvor mange registreringer som ble importert.
- For å importere på nytt senere kan du kjøre tjenesten `babyes.import_history`. Den legger bare til det som mangler.

Ta en full sikkerhetskopi av Home Assistant før første import.
