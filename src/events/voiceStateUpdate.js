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
		if (oldState.channelID !== newState.channelID && newState.channelID) {
			console.log(`[Voice] Just joined voice channel '${newState.channelID}'!`);
			await newState.channel.join();
		}
	}
}

module.exports = VoiceStateUpdateEvent;
