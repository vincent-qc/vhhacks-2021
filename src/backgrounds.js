// @ts-check
const { resolveImage } = require('canvas-constructor');
const { join } = require('path');

const bgLinks = {
	0: 'https://i.imgur.com/JK8dSfB.png',
	1: 'https://i.imgur.com/994lcbQ.png',
	2: 'https://i.imgur.com/ME3vZzY.png',
	3: 'https://i.imgur.com/lbRGKkW.png',
	4: 'https://i.imgur.com/4BCZjFs.png',
	5: 'https://i.imgur.com/q98Vu3U.png',
	6: 'https://i.imgur.com/ziyrGJC.png',
	7: 'https://i.imgur.com/fZqj7oR.png',
};

const dominantColors = {
	0: 0x474a4f,
	1: 0x3f6ab4,
	2: 0x2c1224,
	3: 0x908e89,
	4: 0xb5d7d8,
	5: 0x1a1a1a,
	6: 0x5b5082,
	7: 0x022875,
};

const imageIDs = Object.keys(bgLinks).map((x) => Number(x));

const assetDir = join(__dirname, '..', 'assets');
function loadBackground(id) {
	return resolveImage(join(assetDir, 'images', 'usercard', `bg${id}.png`));
}

module.exports = { bgLinks, loadBackground, imageIDs, dominantColors };
