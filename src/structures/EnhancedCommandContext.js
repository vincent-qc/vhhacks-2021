// @ts-check
const { CommandContext } = require('slash-create');

class EnhancedCommandContext extends CommandContext {
	constructor(...args) {
		// @ts-expect-error
		super(...args);
	}

	/** @returns {import('../client/SchoolmasterClient')} */
	get client() {
		// @ts-expect-error
		return this.creator.client;
	}

	get _guild() {
		if (!this.guildID) return null;
		return this.client.guilds.cache.get(this.guildID);
	}

	get _channel() {
		return this._guild.channels.cache.get(this.channelID);
	}

	async getMember() {
		if (!this.member) return null;
		return this._guild.members.fetch(this.member.id);
	}

	async getUser() {
		return this.client.users.fetch(this.user.id);
	}

	async getMemberOption(option) {
		const member = this.members.get(option);
		if (!member) return null;
		return this._guild.members.fetch(member.id);
	}

	getRoleOption(option) {
		const role = this.roles.get(option);
		if (!role) return null;
		return this._guild.roles.cache.get(role.id);
	}

	getChannelOption(option) {
		const channel = this.channels.get(option);
		if (!channel) return null;
		return this._guild.channels.cache.get(channel.id);
	}

	getUserOption(option) {
		const user = this.users.get(option);
		if (!user) return null;
		return this.client.users.fetch(user.id);
	}
}

module.exports = EnhancedCommandContext;
