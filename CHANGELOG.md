# Changelog

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
