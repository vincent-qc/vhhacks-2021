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

		console.log(this.event);
	}

	async exec() {
		console.log(`Logged in as ${this.client.user.tag}!`);

		const postgresVersion = await sql`SELECT version()`;
		console.log("Result of 'SELECT version()'", postgresVersion);
	}
}

module.exports = ReadyEvent;
