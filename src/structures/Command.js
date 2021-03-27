// @ts-check
const { SlashCommand } = require('slash-create');

class Command extends SlashCommand {
	/**
	 * @param creator {import('slash-create').SlashCreator}
	 * @param opts {import('slash-create').SlashCommandOptions}
	 */
	constructor(creator, opts) {
		super(creator, opts);
	}

	/** @returns {import('../client/SchoolmasterClient')} */
	get client() {
		return this.creator.client;
	}
}

module.exports = Command;
