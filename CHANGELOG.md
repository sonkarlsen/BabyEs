# Changelog

Each release says whether Home Assistant needs a restart. Card-only updates only need a reload of the dashboard.

## 0.2.1

Restart needed: **yes**, once. After this, updates that only change the card need just a page reload.

### Card
- Bottles in the timeline now always stand out from sleep: the card picks the theme colour that differs most from the sleep colour when the theme's accent colour is too similar. Bottle marks are also taller and outlined, so they show on top of sleep periods.

### Integration
- Card updates now show after a page reload, without restarting Home Assistant.
- BabyEs now ships its own icon (light and dark), shown in Home Assistant 2026.3 and later, for example under Devices & services and in HACS updates.

## 0.2.0

### Card
- New layout: today's sleep and bottles side by side in one strip. Tap it to open the history.
- New "Show timeline": a 24-hour line with sleep periods and every bottle. The card remembers the choice on each device.
- The card now uses the colours of your Home Assistant theme (light and dark) instead of its own. `babyes-*` theme variables still override them.
- Times follow the time format in your Home Assistant profile (12 or 24 hours), also in English.
- Switching language in your profile updates the card right away, including an open pop-up.
- Pop-ups slide up and down, their content fades in, and amounts give a small bounce when changed. Turned off when your device asks for reduced motion.

### Integration
- Removed the import from the earlier stand-alone sleep and bottle integrations (the setup option and the `babyes.import_history` service). Entries that were already imported stay in BabyEs.

### Repository
- New logo (`images/logo.svg`) and social preview image.

## 0.1.0

- First version.
