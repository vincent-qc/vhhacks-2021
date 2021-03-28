// @ts-check
const Event = require('../structures/Event');
const sql = require('../database');

class ReadyEvent extends Event {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			once: true,
		});
	}

	async exec() {
		console.log(`Logged in as ${this.client.user.tag}!`);
		await this.runMigrations();
		await this.client.settingsManager.init();
		console.log('Synced database.');
	}

	async runMigrations() {
		await sql`
			CREATE TABLE IF NOT EXISTS guild_settings (
				id               VARCHAR(19),
				swear_log        VARCHAR(19),

				PRIMARY KEY (id)
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS members (
				id         VARCHAR(19),
				guild_id   VARCHAR(19),
				color      INTEGER,
				background INTEGER DEFAULT 0,
				reputation INTEGER DEFAULT 0,

				PRIMARY KEY (id, guild_id)
			);
		`;
	}
}

module.exports = ReadyEvent;
