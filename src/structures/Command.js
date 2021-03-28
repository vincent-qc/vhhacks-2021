// @ts-check
const { SlashCommand } = require('slash-create');
const EnhancedCommandContext = require('./EnhancedCommandContext');

const Emojis = require('../emojis');

class Command extends SlashCommand {
	/**
	 * @param creator {import('slash-create').SlashCreator}
	 * @param opts {import('slash-create').SlashCommandOptions & { ownerOnly?: boolean, adminOnly?: boolean }}
	 */
	constructor(creator, { ownerOnly, adminOnly, ...opts }) {
		super(creator, opts);
		this.ownerOnly = ownerOnly;
		this.adminOnly = adminOnly;
	}

	/** @returns {import('../client/SchoolmasterClient')} */
	get client() {
		// @ts-expect-error
		return this.creator.client;
	}

	async run(ctx) {
		const enhanced = new EnhancedCommandContext(ctx);
		const wasBlocked = await this.runInhibitors(enhanced);
		if (!wasBlocked) this.exec(enhanced);
	}

	/** @param ctx {EnhancedCommandContext} */
	exec(ctx) {
		throw new Error('Command#exec() not implemented.');
	}

	/** @param ctx {EnhancedCommandContext} */
	async runInhibitors(ctx) {
		// Block if no guild
		if (!ctx.guildID) {
			ctx.send(`${Emojis.ERROR} This command may only be used in a guild.`, { ephemeral: true });
			return true;
		}

		if (this.ownerOnly && !this.client.isOwner(ctx.userID)) {
			ctx.send(`${Emojis.ERROR} This command may only be used by bot owners.`, { ephemeral: true });
			return true;
		}

		if (this.adminOnly) {
			const member = await ctx.fetchMember();
			if (!member.permissions.has('ADMINISTRATOR')) {
				ctx.send(`${Emojis.ERROR} This command may only be used by server administrators.`, { ephemeral: true });
				return true;
			}
		}

		return false;
	}

	onError(err, ctx) {
		console.log(`[Command] Error while running command:`, err);
		if (!ctx.expired && !ctx.initiallyResponded) {
			return ctx.send(`${Emojis.ERROR} An error occurred while running the command.`, { ephemeral: true });
		}
	}
}

module.exports = Command;
