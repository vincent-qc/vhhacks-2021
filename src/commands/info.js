// @ts-check
const Command = require('../structures/Command');
const { MessageEmbed } = require('discord.js');

class InfoCommand extends Command {
	constructor(creator) {
		super(creator, {
			name: 'info',
			description: 'View information about the bot!',
			guildIDs: ['825168243043336253'],
		});
	}

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async run(ctx) {
		const embed = new MessageEmbed()
			.setAuthor('TODO')
			.setTitle('Information')
			.setDescription('TODO')
			.addField('TODO', 'TODO');

		await ctx.send({ embeds: [embed.toJSON()] });
	}
}

module.exports = InfoCommand;
