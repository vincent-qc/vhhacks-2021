const { SwearKind } = require('./patterns');
const { Collection } = require('discord.js');

function extractInfo(matches) {
	const words = new Collection();
	const swearKinds = { [SwearKind.DEROGATORY]: 0, [SwearKind.RACIST]: 0, [SwearKind.SEXUAL]: 0 };
	for (const match of matches) {
		swearKinds[match.metadata.kind]++;

		const times = words.get(match.metadata.name);
		if (times) words.set(match.metadata.name, times + 1);
		else words.set(match.metadata.name, 1);
	}

	return { swearKinds, words: words.sort((x, y) => y - x) };
}

module.exports = extractInfo;
