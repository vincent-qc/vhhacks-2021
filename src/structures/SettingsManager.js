// @ts-check
const sql = require('../database');
const { Collection } = require('discord.js');

class DatabaseManager {
	cachedGuilds = new Collection();

	async init() {
		const guilds = await sql`SELECT * FROM guild_settings`;
		for (const guild of guilds) this.cachedGuilds.set(guild.id, guild);

		console.log(`[DatabaseManager] Cached ${guilds.length} guilds!`);
	}

	getSettings(id) {
		return this.cachedGuilds.get(id);
	}
}

module.exports = DatabaseManager;
