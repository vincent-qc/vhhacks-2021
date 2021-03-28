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

function getLevel(reputation) {
	return Math.floor(Math.sqrt(reputation) / 50);
}

function getReputation(level) {
	return 50 * level * level;
}

const units = ['K', 'M', 'B', 'T', 'q', 'Q', 'S'];
function formatInt(int) {
	if (int < 1000) return int;
	const unitIdx = Math.floor(String(int).length / 3) - 1;
	const unitSize = 10 ** (3 * unitIdx);

	const wholePart = (int / unitSize).toPrecision(3);
	return `${wholePart} ${units[unitIdx]}`;
}

module.exports = { walkDir, truncate, randInt, getLevel, getReputation, formatInt };
