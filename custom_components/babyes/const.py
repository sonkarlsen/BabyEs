"""Constants for BabyEssentials."""

DOMAIN = "babyes"
VERSION = "0.2.2"

STORAGE_KEY = "babyes.diary"
STORAGE_VERSION = 1

MAX_ML = 1000
MAX_FEED_NOTE = 250
MAX_SLEEP_NOTE = 500

CONF_NAME = "name"
DEFAULT_NAME = "Baby"

FRONTEND_URL = "/babyes_frontend"
CARD_FILE = "babyes-card.js"
# Registered with Home Assistant; it imports CARD_FILE using the file's current
# version, so card-only updates need a page reload, not a restart.
LOADER_FILE = "babyes-loader.js"
