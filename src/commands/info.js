// @ts-check
const Command = require('../structures/Command');
const { MessageEmbed } = require('discord.js');

class InfoCommand extends Command {
	static GITHUB_LINK = 'https://github.com/Crabo-7498/vhhacks-2021';

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
			.setAuthor('Ikenai', this.client.user.displayAvatarURL())
			.setColor(0xffc600)
			.setThumbnail(this.client.user.displayAvatarURL())
			.setTitle('Information')
			.setDescription(
				`
				**Ikenai** is an intelligent anti-swear bot that scans both voice and text messages for traces of profanity.
				It was made for [vhHacks 2021](https://vhhacks.ca) by \`Joe_#2997\` and \`crabo_#7498\`.
			`,
			)
			.addField('Version', '0.1.0')
			.addField(
				'General Statistics',
				`• Guilds: ${this.client.guilds.cache.size}\n• Channels: ${this.client.channels.cache.size}`,
			)
			.addField('Memory Usage', `${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 10) / 10} MB`)
			.addField('Source', `Ikenai is open-source - view it on [GitHub](${InfoCommand.GITHUB_LINK})!`)
			.setTimestamp();

		await ctx.send({ embeds: [embed.toJSON()] });
	}
}

module.exports = InfoCommand;
