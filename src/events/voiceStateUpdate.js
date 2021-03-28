// @ts-check
const Event = require('../structures/Event');

class VoiceStateUpdateEvent extends Event {
	constructor() {
		super('voiceStateUpdate', {
			emitter: 'client',
			event: 'voiceStateUpdate',
		});
	}

	/**
	 * @param oldState {import('discord.js').VoiceState}
	 * @param newState {import('discord.js').VoiceState}
	 */
	async exec(oldState, newState) {
		// Ignore if the user didn't change channels.
		if (oldState.channelID === newState.channelID) return;

		const { guild } = newState;

		// If we're in the old room and it's now empty, leave it.
		if (guild.voice && guild.voice.channelID === oldState.channelID && oldState.channel.members.size === 0) {
			console.log(`[Voice] Just left ${oldState.channelID} as everyone left :(`);
			guild.voice.channel.leave();
		}

		if (newState.channelID && !guild.voice) {
			console.log(`[Voice] Just joined ${newState.channelID} :D`);
			await newState.channel.join();
		}
	}
}

module.exports = VoiceStateUpdateEvent;
