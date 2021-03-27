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

	exec() {
		console.log(`Logged in as ${this.client.user.tag}!`);
	}
}

module.exports = ReadyEvent;
