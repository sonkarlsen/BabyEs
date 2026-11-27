# Changelog

Each release says whether Home Assistant needs a restart. Card-only updates only need a reload of the dashboard.

## 0.3.1

Restart needed: **no** for the card; reload the dashboard. The new name shows under Devices & services after the next restart.

### Name
- BabyEs is now called **BabyEssentials**, in Home Assistant, HACS and the card picker, and the repository is now `sonkarlsen/BabyEssentials`. Nothing changes for an existing setup: the integration id (`babyes`), the card type (`custom:babyes-card`), the services (`babyes.*`), the entities and the stored diary keep their names, so automations and dashboards keep working.

### Card
- While the baby sleeps, the moon lights up: a pale moon on a night sky in your theme's sleep colour, with a slow glow and two twinkling stars, so you can see it at a glance. The sky is darkened just enough to keep the moon clearly readable in any theme. Animations stop with "reduce motion".
- After typing an amount, + and − first round to the step (5 ml by default), then move a whole step: 23, then + gives 25, then 30. − gives 20, then 15.

## 0.3.0

Restart needed: **no**. Reload the dashboard.

### Card
- Messages after saving a bottle or starting and stopping a sleep are shorter: 2 seconds, or 4 seconds when they offer Undo or Change. An × closes them at once, so the history is never blocked.
- Started a sleep late? Tap **Change** in the message after **Start sleep** and pick when the baby actually fell asleep: −5 to −45 minutes, or type the time.
- Breast milk and formula now have clearly different colours, each taken from your theme, with a colour dot next to the name.
- Tap the amount in a new or edited bottle to type it, for example 120 ml, instead of tapping + many times.
- Swipe the sheet down to close it, from the handle and title or from the content when it is scrolled to the top.

## 0.2.2

Restart needed: **no** if 0.2.1 is already installed and Home Assistant has been restarted once since. Coming from 0.2.0 or earlier: yes, once.

### Card
- Stopping a sleep now asks for confirmation first, showing how long the baby has slept. Starting a sleep is still one tap.
- The card is about 15 % lower: tighter spacing and slightly smaller text and buttons.

## 0.2.1

Restart needed: **yes**, once. After this, updates that only change the card need just a page reload.

### Card
- Bottles in the timeline now always stand out from sleep: the card picks the theme colour that differs most from the sleep colour when the theme's accent colour is too similar. Bottle marks are also taller and outlined, so they show on top of sleep periods.

### Integration
- Card updates now show after a page reload, without restarting Home Assistant.
- BabyEssentials now ships its own icon (light and dark), shown in Home Assistant 2026.3 and later, for example under Devices & services and in HACS updates.

## 0.2.0

### Card
- New layout: today's sleep and bottles side by side in one strip. Tap it to open the history.
- New "Show timeline": a 24-hour line with sleep periods and every bottle. The card remembers the choice on each device.
- The card now uses the colours of your Home Assistant theme (light and dark) instead of its own. `babyes-*` theme variables still override them.
- Times follow the time format in your Home Assistant profile (12 or 24 hours), also in English.
- Switching language in your profile updates the card right away, including an open pop-up.
- Pop-ups slide up and down, their content fades in, and amounts give a small bounce when changed. Turned off when your device asks for reduced motion.

### Integration
- Removed the import from the earlier stand-alone sleep and bottle integrations (the setup option and the `babyes.import_history` service). Entries that were already imported stay in BabyEssentials.

### Repository
- New logo (`images/logo.svg`) and social preview image.

## 0.1.0

- First version.
