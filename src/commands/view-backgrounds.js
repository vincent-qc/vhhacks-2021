// @ts-check
const Command = require('../structures/Command');
const sql = require('../database');
const { CommandOptionType } = require('slash-create');
const LazyPaginatedEmbed = require('../structures/LazyPaginatedEmbed');
const { bgLinks, imageIDs, dominantColors } = require('../backgrounds');
const { MessageEmbed } = require('discord.js');

const Emojis = require('../emojis');

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
		});
	}

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async exec(ctx) {
		await ctx.send(`${Emojis.LOADING} Generating the background display...`);

		const id = ctx.options['image-id'];
		const index = id ? imageIDs.indexOf(id) : 0;
		if (index === -1) {
			await ctx.send(
				`${Emojis.ERROR} Invalid background ID supplied. Check out a list of valid ones using the \`view-backgrounds\` command.`,
				{ ephemeral: true },
			);
			return;
		}

		const embed = await this.generatePage(index + 1);
		const message = await ctx.sendFollowUp({ embeds: [embed.toJSON()] });
		const djsMessage = await ctx.channel.messages.fetch(message.id);

		await new LazyPaginatedEmbed()
			.setGenerator((page) => this.generatePage(page))
			.setIdleTimeout(60_000)
			.setStartPage(index + 1)
			.start(djsMessage, ctx.userID);
	}

	generatePage(page) {
		const index = page - 1;
		if (index >= imageIDs.length || index < 0) return undefined;
		const id = imageIDs[index];
		const color = dominantColors[index];
		return new MessageEmbed()
			.setAuthor('Ikenai', this.client.user.displayAvatarURL())
			.setTitle(`Background ${page}/${imageIDs.length}`)
			.setColor(color)
			.setImage(bgLinks[id])
			.setFooter(`Equip this background by using /background ${id}`)
			.setTimestamp();
	}
}

module.exports = ViewBackgroundsCommand;
