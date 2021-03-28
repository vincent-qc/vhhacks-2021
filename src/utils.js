// @ts-check
const { readdir } = require('fs/promises');
const { join } = require('path');

async function* walkDir(directory) {
	const dirents = await readdir(directory, { withFileTypes: true });

	for (const dirent of dirents) {
		const path = join(directory, dirent.name);
		if (dirent.isDirectory()) yield* walkDir(path);
		else yield path;
	}
}

function truncate(text, n) {
	if (text.length > n) return `${text.slice(0, n - 3)}...`;
	return text;
}

/** generates a random integer in the range [low, high], inclusive on both ends! */
function randInt(low, high) {
	const diff = high - low;
	return low + Math.round(Math.random() * diff);
}

module.exports = { walkDir, truncate, randInt };
