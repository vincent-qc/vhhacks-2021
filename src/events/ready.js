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
		this.runMigrations();
		console.log('Synced database.');
	}

	async runMigrations() {
		await sql`
			CREATE TABLE IF NOT EXISTS guild_settings (
				id               VARCHAR(19),
				swear_log        VARCHAR(19),
				publisher_role   VARCHAR(19),
				subscriber_roles JSONB NOT NULL DEFAULT '{}'::JSONB,

				PRIMARY KEY (id)
			);
		`;

		await sql`
			CREATE TABLE IF NOT EXISTS members (
				id         VARCHAR(19),
				color      INTEGER,
				reputation INTEGER,
			);
		`;
	}
}

module.exports = ReadyEvent;
