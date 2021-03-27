// @ts-check
const { Collection } = require('discord.js');
const { readdir } = require('fs/promises');
const { join } = require('path');

const { walkDir } = require('../utils');
const Event = require('./Event');

class EventHandler {
	/** @param client {import('../client/SchoolmasterClient')} */
	constructor(client) {
		this.client = client;
		this.registry = new Collection();
	}

	async loadAll(directory) {
		for await (const path of walkDir(directory)) {
			console.log(`[EventHandler]: importing event from path '${path}'`);
			const Constructor = require(path);

			let mod;
			try {
				mod = new Constructor();
				if (!(mod instanceof Event)) throw new Error(`No known event exported from '${path}'`);
			} catch (error) {
				throw new Error(`Error creating event at path '${path}'`);
			}
			this.registry.set(mod.id, mod);

			mod.client = this.client;
			mod.handler = this;

			this.register(mod);
		}
	}

	register(mod) {
		let emitter;
		switch (mod.emitter) {
			case 'client':
				emitter = this.client;
				break;
			case 'ws':
				emitter = this.client.ws;
				break;
			default:
				throw new Error(`Unknown emitter for event '${mod.id}': ${mod.emitter}`);
		}

		if (mod.once) emitter.once(mod.event, (...args) => mod.exec(...args));
		else emitter.on(mod.event, (...args) => mod.exec(...args));

		console.log(`[EventHandler]: registered event '${mod.id}'`);
	}
}

module.exports = EventHandler;
