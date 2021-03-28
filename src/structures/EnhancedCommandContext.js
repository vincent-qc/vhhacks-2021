// @ts-check
const { CommandContext } = require('slash-create');

class EnhancedCommandContext {
	/** @param {CommandContext} ctx */
	constructor(ctx) {
		this._ctx = ctx;

		/** @type {import('../client/SchoolmasterClient')} */
		// @ts-expect-error
		this.client = ctx.creator.client;
		this.guild = ctx.guildID ? this.client.guilds.cache.get(ctx.guildID) : null;
		this.channel = this.guild.channels.cache.get(ctx.channelID);
		this.userID = ctx.user.id;

		this.creator = ctx.creator;
		this.data = ctx.data;
		this.interactionToken = ctx.interactionToken;
		this.interactionID = ctx.interactionID;
		this.channelID = ctx.channelID;
		this.guildID = ctx.guildID;
		this.commandName = ctx.commandName;
		this.commandID = ctx.commandID;
		this.options = ctx.options;
		this.subcommands = ctx.subcommands;
		this.invokedAt = ctx.invokedAt;
	}

	get expired() {
		return this._ctx.expired;
	}

	get deferred() {
		return this._ctx.deferred;
	}

	get initiallyResponded() {
		return this._ctx.initiallyResponded;
	}

	/**
	 * @param {Parameters<CommandContext['send']>[0]} content
	 * @param {Parameters<CommandContext['send']>[1]} [options]
	 */
	send(content, options) {
		return this._ctx.send(content, options);
	}

	/**
	 * @param {Parameters<CommandContext['sendFollowUp']>[0]} content
	 * @param {Parameters<CommandContext['sendFollowUp']>[1]} [options]
	 */
	sendFollowUp(content, options) {
		return this._ctx.sendFollowUp(content, options);
	}

	/**
	 * @param {Parameters<CommandContext['edit']>[0]} messageID
	 * @param {Parameters<CommandContext['edit']>[1]} content
	 * @param {Parameters<CommandContext['edit']>[2]} [options]
	 */
	edit(messageID, content, options) {
		return this._ctx.edit(messageID, content, options);
	}

	/**
	 * @param {Parameters<CommandContext['editOriginal']>[0]} content
	 * @param {Parameters<CommandContext['editOriginal']>[1]} [options]
	 */
	editOriginal(content, options) {
		return this._ctx.editOriginal(content, options);
	}

	/** @param {string | undefined} messageID */
	delete(messageID) {
		return this._ctx.delete(messageID);
	}

	/** @param {boolean | undefined} ephemeral */
	defer(ephemeral) {
		return this._ctx.defer(ephemeral);
	}

	async fetchMember() {
		if (!this._ctx.member) return null;
		return this.guild.members.fetch(this._ctx.member.id);
	}

	async fetchUser() {
		return this.client.users.fetch(this._ctx.user.id);
	}

	getChannelOption(option) {
		const id = this._ctx.options[option];
		if (!id) return null;
		// @ts-expect-error
		return this.guild.channels.cache.get(id);
	}

	getRoleOption(option) {
		const id = this._ctx.options[option];
		if (!id) return null;
		// @ts-expect-error
		return this.guild.roles.cache.get(id);
	}

	async fetchMemberOption(option) {
		const id = this._ctx.options[option];
		if (!id) return null;
		// @ts-expect-error
		return this.guild.members.fetch(id);
	}

	async fetchUserOption(option) {
		const id = this._ctx.options[option];
		if (!id) return null;
		// @ts-expect-error
		return this.client.users.fetch(id);
	}
}

module.exports = EnhancedCommandContext;
