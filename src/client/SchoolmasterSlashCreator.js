// @ts-check
const { SlashCreator } = require('slash-create');

class SchoolmasterSlashCreator extends SlashCreator {
	/**
	 * @param client {import('./SchoolmasterClient')}
	 * @param options {object}
	 */
	constructor(client, options) {
		super(options);
		this.client = client;
	}
}

module.exports = SchoolmasterSlashCreator;
