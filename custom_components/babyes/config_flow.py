"""Set up BabyEs from the UI. The name you enter stays in your Home Assistant only."""
from __future__ import annotations

try:
    import probatio as vol  # Home Assistant 2026+
except ImportError:
    import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback

from .const import CONF_NAME, DEFAULT_NAME, DOMAIN


def _name(value) -> str:
    return (str(value or "").strip() or DEFAULT_NAME)[:40]


class BabyEsConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        if user_input is not None:
            name = _name(user_input.get(CONF_NAME))
            return self.async_create_entry(title=name, data={CONF_NAME: name})
        return self.async_show_form(step_id="user", data_schema=vol.Schema({
            vol.Required(CONF_NAME, default=DEFAULT_NAME): str,
        }))

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return BabyEsOptionsFlow()


class BabyEsOptionsFlow(config_entries.OptionsFlow):
    async def async_step_init(self, user_input=None):
        if user_input is not None:
            name = _name(user_input.get(CONF_NAME))
            self.hass.config_entries.async_update_entry(self.config_entry, title=name)
            return self.async_create_entry(data={CONF_NAME: name})
        current = self.config_entry.options.get(CONF_NAME) or self.config_entry.data.get(CONF_NAME, DEFAULT_NAME)
        return self.async_show_form(step_id="init", data_schema=vol.Schema({
            vol.Required(CONF_NAME, default=current): str,
        }))
