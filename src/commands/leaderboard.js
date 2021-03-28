// @ts-check
const Command = require('../structures/Command');
const { CommandOptionType } = require('slash-create');
const sql = require('../database');
const { MessageEmbed } = require('discord.js');
const { join } = require('path');

const LazyPaginatedEmbed = require('../structures/LazyPaginatedEmbed');
const { getLevel, formatInt } = require('../utils');

class LeaderboardCommand extends Command {
	constructor(creator) {
		super(creator, {
			name: 'leaderboard',
			description: 'Displays the reputation leaderboard of the server',
			options: [
				{
					type: CommandOptionType.INTEGER,
					name: 'page',
					description: 'The page to view in the leaderboard',
					required: false,
				},
			],
			guildIDs: ['825168243043336253'],
		});
	}

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async exec(ctx) {
		await ctx.send('<a:loading:825489363831357460> Generating the leaderboard...');

		const page = ctx.options.page ?? 1;
		if (page < 1 || page > 500_000) {
			await ctx.send("That's not a valid page, please try again.", { ephemeral: true });
			return;
		}

		const embed = await this.generatePage(page, ctx.guildID);
		if (!embed) {
			await ctx.send('No users were found on that page, please try again.', { ephemeral: true });
			return;
		}

		const message = await ctx.sendFollowUp({ embeds: [embed.toJSON()] });
		const djsMessage = await ctx.channel.messages.fetch(message.id);

		await new LazyPaginatedEmbed()
			.setGenerator((page) => this.generatePage(page, ctx.guildID))
			.setIdleTimeout(60_000)
			.setStartPage(page)
			.start(djsMessage, ctx.userID);
	}

	async generatePage(page, guildID) {
		const offset = (page - 1) * 10;

		const rows = await sql`
			SELECT reputation, position, id FROM (
				SELECT id, reputation, RANK() OVER (ORDER BY reputation DESC) AS position
				FROM members
				WHERE guild_id = ${guildID}
			) as t
			ORDER BY reputation DESC
			LIMIT 10
			OFFSET ${offset}
		`;

		if (!rows.length) return undefined;

		const description = rows
			.map((row) => {
				const user = this.client.users.cache.get(row.id);
				const level = getLevel(row.reputation);
				const formattedRep = formatInt(row.reputation);
				return `**${row.position}.** [\`${user?.tag ?? 'not real#????'}\`](${
					user?.displayAvatarURL() ?? 'https://discordapp.com'
				}) — Level ${level} (${formattedRep} exp)`;
			})
			.join('\n');

		return new MessageEmbed()
			.setTitle('Reputation Leaderboard')
			.setThumbnail('https://cdn.discordapp.com/attachments/825168243043336256/825569860355751966/trophy.png')
			.setColor(0xffc600)
			.setDescription(description)
			.setFooter(`Page ${page} | Use reactions to navigate`)
			.setTimestamp();
	}
}

module.exports = LeaderboardCommand;
