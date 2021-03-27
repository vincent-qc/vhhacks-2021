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

module.exports = { walkDir };
