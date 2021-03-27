// @ts-check
const fs = require('fs');
const { Readable } = require('stream');
const Event = require('../structures/Event');
const { SpeechClient } = require('@google-cloud/speech');
const { MessageAttachment } = require('discord.js');

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
		if (speaking.bitfield === 0 || member.user.bot) return;

		// If we're already listening to a channel in the guild, return early, as we can't join two channels at the same time.
		if (member.guild.voice && member.guild.voice.channelID !== member.voice.channelID) return;

		const connection = member.guild.voice?.connection ?? (await member.voice.channel.join());
		// Play a short silence frame so Discord lets us receive audio.
		connection.play(new Silence(), { type: 'opus' });

		const audio = connection.receiver.createStream(member, { mode: 'pcm' });

		let chunks = [];
		audio
			.on('data', (chunk) => chunks.push(chunk))
			.on('end', async () => {
				const buffer = this.convertStereoToMono(Buffer.concat(chunks));

				const audio = {
					content: buffer.toString('base64'),
				};
				const config = {
					encoding: 'LINEAR16',
					sampleRateHertz: 48000,
					languageCode: 'en-US',
				};
				const request = { audio, config };

				// @ts-expect-error
				const [response] = await speechClient.recognize(request);
				console.log(response);
				const c = this.client.channels.cache.get('825168243043336256');
				const transcript = response.results.map((result) => result.alternatives[0].transcript).join('\n');
				if (transcript.length) c.send(`Transcript: ${transcript}`);

				// @ts-expect-error
				c.send(new MessageAttachment(buffer, 'recording.pcm'));
			});
	}

	// https://github.com/healzer/DiscordEarsBot/blob/master/index.js#L37
	// MIT License
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
}

module.exports = GuildMemberSpeakingEvent;
