// @ts-check
const Command = require('../structures/Command');
const sql = require('../database');
const { CommandOptionType } = require('slash-create');
const LazyPaginatedEmbed = require('../structures/LazyPaginatedEmbed');
const { bgLinks, imageIDs } = require('../backgrounds');
const { MessageEmbed } = require('discord.js');

class ViewBackgroundsCommand extends Command {
	constructor(creator) {
		super(creator, {
			name: 'view-backgrounds',
			description: 'Views all the backgrounds available',
			options: [
				{
					type: CommandOptionType.INTEGER,
					name: 'image-id',
					description: 'The ID of the background to view',
					choices:
						imageIDs.length <= 25
							? imageIDs.map((id) => ({ name: `background-${id.toString()}`, value: id }))
							: undefined,
					required: false,
				},
			],
			guildIDs: ['825168243043336253'],
		});
	}

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async exec(ctx) {
		await ctx.send('<a:loading:825489363831357460> Generating the background display...');

		const id = ctx.options['image-id'];
		const index = id ? imageIDs.indexOf(id) : 0;
		if (index === -1) {
			await ctx.send(
				`Invalid background ID supplied. Check out a list of valid ones using the view-backgrounds command.`,
				{ ephemeral: true },
			);
			return;
		}

		const embed = await this.generatePage(index + 1);
		const message = await ctx.sendFollowUp({ embeds: [embed.toJSON()] });
		const djsMessage = await ctx.channel.messages.fetch(message.id);

		await new LazyPaginatedEmbed()
			.setGenerator(this.generatePage)
			.setIdleTimeout(60_000)
			.setStartPage(index + 1)
			.start(djsMessage, ctx.userID);
	}

	generatePage(page) {
		const index = page - 1;
		const id = imageIDs[index];
		return new MessageEmbed()
			.setTitle('Available backgrounds')
			.setColor('ORANGE')
			.setImage(bgLinks[id])
			.setFooter(`Equip this background by using /background ${id}`)
			.setTimestamp();
	}
}

module.exports = ViewBackgroundsCommand;
