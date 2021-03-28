// @ts-check
const sql = require('../database');
const { Collection } = require('discord.js');

class SettingsManager {
	cache = new Collection();

	async init() {
		const guilds = await sql`SELECT * FROM guild_settings`;
		for (const guild of guilds) this.cache.set(guild.id, guild);

		console.log(`[DatabaseManager] Cached ${guilds.length} guilds!`);
	}

	get(id) {
		return this.cache.get(id);
	}

	set(id, key, value) {
		const data = this.cache.get(id) ?? { id };
		data[key] = value;
		this.cache.set(id, data);

		return sql`
			INSERT INTO guild_settings (id, swear_log)
			VALUES (${id}, ${data.swear_log ?? null})
			ON CONFLICT (id)
			DO UPDATE SET swear_log = ${data.swear_log ?? null}
		`;
	}

	delete(id, key) {
		const data = this.cache.get(id) ?? { id };
		delete data[key];

		return sql`
			INSERT INTO guild_settings (id, swear_log)
			VALUES (${id}, ${data.swear_log ?? null})
			ON CONFLICT (id)
			DO UPDATE SET swear_log = ${data.swear_log ?? null}
		`;
	}

	clear(id) {
		this.cache.delete(id);
		return sql`DELETE FROM guild_settings WHERE id = ${id}`;
	}
}

module.exports = SettingsManager;
