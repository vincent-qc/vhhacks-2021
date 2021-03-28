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
		const data = this.cache.get(id) ?? { id, subscriber_roles: {} };
		data[key] = value;
		this.cache.set(id, data);

		return sql`
			INSERT INTO guild_settings (id, swear_log, publisher_role, subscriber_roles)
			VALUES (${id}, ${data.swear_log ?? null}, ${data.publisher_role ?? null}, ${sql.json(data.subscriber_roles ?? {})})
			ON CONFLICT (id)
			DO UPDATE SET
				swear_log = ${data.swear_log ?? null},
				publisher_role = ${data.publisher_role ?? null},
				subscriber_roles = ${JSON.stringify(data.subscriber_roles ?? {})}
		`;
	}

	delete(id, key) {
		const data = this.cache.get(id) ?? { id, subscriber_roles: {} };
		delete data[key];

		return sql`
			INSERT INTO guild_settings (id, swear_log, publisher_role, subscriber_roles)
			VALUES (${id}, ${data.swear_log ?? null}, ${data.publisher_role ?? null}, ${sql.json(data.subscriber_roles ?? {})})
			ON CONFLICT (id)
			DO UPDATE SET
				swear_log = ${data.swear_log ?? null},
				publisher_role = ${data.publisher_role ?? null},
				subscriber_roles = ${sql.json(data.subscriber_roles ?? {})}
		`;
	}

	clear(id) {
		this.cache.delete(id);
		return sql`DELETE FROM guild_settings WHERE id = ${id}`;
	}
}

module.exports = SettingsManager;
