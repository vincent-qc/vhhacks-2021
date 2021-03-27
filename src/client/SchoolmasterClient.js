// @ts-check
const { Client, Intents } = require('discord.js');
const EventHandler = require('../structures/EventHandler');
const { join } = require('path');

class SchoolmasterClient extends Client {
	constructor() {
		super({
			allowedMentions: {
				parse: ['users'],
			},
			ws: {
				intents: Intents.ALL,
			},
		});

		this.events = new EventHandler(this);
	}

	async start() {
		await this.events.loadAll(join(__dirname, '..', 'events'));
		return this.login(process.env.TOKEN);
	}
}

module.exports = SchoolmasterClient;
