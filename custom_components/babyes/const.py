"""Constants for BabyEs."""

DOMAIN = "babyes"
VERSION = "0.1.0"

STORAGE_KEY = "babyes.diary"
STORAGE_VERSION = 1

MAX_ML = 1000
MAX_FEED_NOTE = 250
MAX_SLEEP_NOTE = 500

CONF_NAME = "name"
CONF_IMPORT = "import_legacy"
DEFAULT_NAME = "Baby"

# Storage keys of the two earlier stand-alone integrations. They are only ever
# READ (never written or removed) when importing history into BabyEs.
LEGACY_FEED_KEY = "mating_tracker.feeds"
LEGACY_SLEEP_KEY = "nordic_sleep_tracker_log"

FRONTEND_URL = "/babyes_frontend"
CARD_FILE = "babyes-card.js"
