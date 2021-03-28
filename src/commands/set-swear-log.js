// @ts-check
const Command = require('../structures/Command');
const { CommandOptionType } = require('slash-create');

const Emojis = require('../emojis');

class SetSwearLogCommand extends Command {
	constructor(creator) {
		super(creator, {
			name: 'set-swear-log',
			description: 'Sets the swear log channel',
			options: [
				{
					type: CommandOptionType.CHANNEL,
					name: 'channel',
					description: 'Channel to use',
					required: true,
				},
			],
			adminOnly: true,
			guildIDs: ['825168243043336253'],
		});
	}

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async exec(ctx) {
		const channel = ctx.getChannelOption('channel');
		if (!channel.isText()) {
			return void ctx.send(
				`${Emojis.ERROR} Sorry, I can't set the swear log channel to that as it is not a text channel.`,
				{
					ephemeral: true,
				},
			);
		}

		if (
			!channel.permissionsFor(this.client.user).has('SEND_MESSAGES') ||
			!channel.permissionsFor(this.client.user).has('VIEW_CHANNEL')
		) {
			return void ctx.send(
				`${Emojis.ERROR} Sorry, I can't set the swear log channel to that as I do not have the necessary permissions to send messages to it.`,
			);
		}

		try {
			await this.client.settingsManager.set(ctx.guildID, 'swear_log', channel.id);
			return void ctx.send(`${Emojis.CHECK} Successfully updated the swear log channel!`, { ephemeral: true });
		} catch (error) {
			console.log('[Database] Failed setting swear log:', error);
			return void ctx.send(`${Emojis.ERROR} An error occurred when updating the swear log channel, please try again.`, {
				ephemeral: true,
			});
		}
	}
}

module.exports = SetSwearLogCommand;
