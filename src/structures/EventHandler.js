// @ts-check
const { Collection } = require('discord.js');
const { readdir } = require('fs/promises');
const { join } = require('path');

const Event = require('./Event');

class EventHandler {
	/** @param client {import('discord.js').Client} */
	constructor(client) {
		this.client = client;
		this.registry = new Collection();
	}

	/** @param directory {string} */
	async loadAll(directory) {
		for await (const path of EventHandler.walkDir(directory)) {
			const Constructor = require(path);
			const mod = new Constructor();
			mod.client = this.registry.set(mod.id, mod);
		}
	}

	register(event) {}

	/** @param directory {string} */
	static async *walkDir(directory) {
		const dirents = await readdir(directory, { withFileTypes: true });

		for (const dirent of dirents) {
			const path = join(directory, dirent.name);
			if (dirent.isDirectory()) yield* this.walkDir(path);
			else yield path;
		}
	}
}
