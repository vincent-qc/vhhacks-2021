// @ts-check
const { Readable } = require('stream');
const Event = require('../structures/Event');
const { SpeechClient } = require('@google-cloud/speech');
const { MessageEmbed } = require('discord.js');
const { directMatch } = require('../filter/match');
const { SwearKind } = require('../filter/patterns');
const { TextHighlighter } = require('../structures/TextHighlighter');
const extractInfo = require('../filter/extractInfo');
const { truncate, randInt } = require('../utils');
const sql = require('../database');

const speechClient = new SpeechClient();

const SILENCE_FRAME = Buffer.from([0xf8, 0xff, 0xfe]);

class Silence extends Readable {
	_read() {
		this.push(SILENCE_FRAME);
		this.destroy();
	}
}

class GuildMemberSpeakingEvent extends Event {
	constructor() {
		super('guildMemberSpeaking', {
			emitter: 'client',
			event: 'guildMemberSpeaking',
		});
	}

	/**
	 * @param member {import('discord.js').GuildMember}
	 * @param speaking {import('discord.js').Speaking}
	 */
	async exec(member, speaking) {
		if (!this.client.enableTranscription || speaking.bitfield === 0 || member.user.bot) return;

		// If we're already listening to a channel in the guild, return early, as we can't join two channels at the same time.
		if (member.guild.voice && member.guild.voice.channelID !== member.voice.channelID) return;

		const connection = member.guild.voice?.connection ?? (await member.voice.channel.join());

		// Play a short silence frame so Discord lets us receive audio.
		connection.play(new Silence(), { type: 'opus' });

		const audio = connection.receiver.createStream(member, { mode: 'pcm' });

		// Array of buffers received.
		const chunks = [];
		audio
			.on('data', (chunk) => chunks.push(chunk))
			.on('end', async () => {
				// Convert stereo audio to mono audio - Google speech to text wants mono.
				const buffer = this.convertStereoToMono(Buffer.concat(chunks));

				const audio = { content: buffer.toString('base64') };
				const config = {
					encoding: 'LINEAR16',
					sampleRateHertz: 48000,
					languageCode: 'en-US',
				};

				// @ts-expect-error
				const [response] = await speechClient.recognize({ audio, config });
				const transcript = response.results.map((result) => result.alternatives[0].transcript).join('\n');

				const logChannelID = this.client.settingsManager.get(member.guild.id)?.swear_log;
				if (!logChannelID) return;

				const logChannel = this.client.channels.cache.get(logChannelID);
				if (!logChannel) return;

				const matches = directMatch(transcript);
				if (!matches.length) return;

				member.send("Hey there, please don't swear in voice channels.").catch(() => {});

				logChannel
					.send(this.createLog(transcript, matches, member.voice.channel, member.user))
					.catch((error) => console.log('Failed to send message to swear log channel:', error));

				const toRemove = randInt(35, 45);
				sql`
					UPDATE members
					SET reputation = GREATEST(reputation - ${toRemove}, 0)
					WHERE
						guild_id = ${member.guild.id}
						AND id = ${member.user.id}
				`
					.then(() =>
						console.log(
							`Removed ${toRemove} reputation from ${member.user.id} in ${member.guild.id} as they swore in a voice channel.`,
						),
					)
					.catch((error) =>
						console.log('Failed to remove reputation from user due to swearing in a voice channel:', error),
					);
			});
	}

	// https://dev.to/codr/raw-stereo-audio-to-mono-channel-113a
	convertStereoToMono(buffer) {
		try {
			const data = new Int16Array(buffer);
			const newData = new Int16Array(buffer.length / 2);
			for (let i = 0, j = 0; i < data.length; i += 4) {
				newData[j++] = data[i];
				newData[j++] = data[i + 1];
			}

			return Buffer.from(newData);
		} catch (error) {
			console.log(`[Voice] Error converting audio:`, error);
			throw error;
		}
	}

	createLog(text, matches, channel, user) {
		const highlighter = new TextHighlighter(text);
		for (const match of matches) highlighter.highlight(match.startIndex, match.endIndex);

		const { swearKinds, words } = extractInfo(matches);

		return new MessageEmbed()
			.setAuthor('Voice Channel Swear Logs', 'https://cdn.discordapp.com/emojis/274789152342671360.png?v=1')
			.addField('Channel', `\`${channel.name}\` (${channel.id})`)
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
			.addField('Transcript', truncate(highlighter.getText(), 1000))
			.setColor('ORANGE')
			.setTimestamp();
	}
}

module.exports = GuildMemberSpeakingEvent;
