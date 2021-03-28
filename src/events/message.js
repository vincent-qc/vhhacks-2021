// @ts-check
const Event = require('../structures/Event');
const { match } = require('../filter/match');
const { TextHighlighter } = require('../structures/TextHighlighter');
const { MessageEmbed } = require('discord.js');
const { truncate } = require('../utils');

const extractInfo = require('../filter/extractInfo');
const { SwearKind } = require('../filter/patterns');
const sql = require('../database');
const CooldownManager = require('../structures/CooldownManager');
const { randInt } = require('../utils');

class MessageEvent extends Event {
	repCooldownManager = new CooldownManager(60_000);

	constructor() {
		super('message', {
			emitter: 'client',
			event: 'message',
		});
	}

	async exec(message) {
		if (message.author.bot || !message.guild || !message.content) return;
		const hadSwears = await this.checkSwears(message);
		if (hadSwears) {
			const toRemove = randInt(35, 45);
			return sql`
				UPDATE members
				SET reputation = GREATEST(reputation - ${toRemove}, 0)
				WHERE
					guild_id = ${message.guild.id}
					AND id = ${message.author.id}
			`
				.then(() =>
					console.log(
						`Removed ${toRemove} reputation from ${message.author.id} in ${message.guild.id} as they swore in a text channel.`,
					),
				)
				.catch((error) =>
					console.log('Failed to remove reputation from user due to swearing in a text channel:', error),
				);
		}

		const isCooldown = this.repCooldownManager.request(message.author.id);
		if (isCooldown) return;

		// Give 15-25 rep for each message with cooldown of 1 minute
		const toAdd = randInt(15, 25);
		await sql`
			INSERT INTO members (id, guild_id, color, background, reputation)
			VALUES (${message.author.id}, ${message.guild.id}, null, null, ${toAdd})
			ON CONFLICT (id, guild_id)
			DO UPDATE SET reputation = members.reputation + EXCLUDED.reputation
		`
			.then(() => console.log(`Gave ${toAdd} reputation points to ${message.author.id} in ${message.guild.id}`))
			.catch((error) => console.log('Error giving reputation points:', error));
	}

	async checkSwears(message) {
		const logChannelID = this.client.settingsManager.get(message.guild.id)?.swear_log;
		if (!logChannelID) return false;

		const logChannel = this.client.channels.cache.get(logChannelID);
		if (!logChannel) return false;

		const matches = match(message.content);
		if (!matches.length) return false;

		if (message.deletable) message.delete();
		const msg = await message.channel.send(`Hey ${message.author}, please don't swear here!`);
		setTimeout(() => {
			if (msg.deletable) msg.delete().catch((error) => console.log('Error deleting message:', error));
		}, 3000);

		logChannel
			.send(this.createLog(message.content, matches, message.channel, message.author))
			.catch((error) => console.log('Failed to send message to swear log channel:', error));

		return true;
	}

	createLog(text, matches, channel, user) {
		const highlighter = new TextHighlighter(text);
		for (const match of matches) highlighter.highlight(match.startIndex, match.endIndex);

		const { swearKinds, words } = extractInfo(matches);

		return new MessageEmbed()
			.setAuthor('Text Channel Swear Logs', 'https://cdn.discordapp.com/emojis/274789152074104833.png?v=1')
			.addField('Channel', `${channel} (${channel.id})`)
			.addField('User', `${user.tag} (${user.id})`)
			.addField(
				'Summary',
				`
					<:small_red_diamond:825492067030532136> **Derogatory:** ${swearKinds[SwearKind.DEROGATORY]}
					🔸 **Sexual:** ${swearKinds[SwearKind.SEXUAL]}
					<:small_yellow_diamond:825492066749382657> **Racist:** ${swearKinds[SwearKind.RACIST]}
				`,
			)
			.addField('Matched Words', words.map((count, word) => `\`${word}\` — ${count}`).join('\n'))
			.addField('Message', truncate(highlighter.getText(), 1000))
			.setColor('ORANGE')
			.setTimestamp();
	}
}

module.exports = MessageEvent;
