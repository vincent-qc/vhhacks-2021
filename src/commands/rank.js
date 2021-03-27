// @ts-check
const Command = require('../structures/Command');
const { Canvas, resolveImage } = require('canvas-constructor');
const fs = require('fs/promises');
const { join } = require('path');

class RankCommand extends Command {
	// Lazy load bg + pfp drop image once
	bgImage = null;
	pfpDropImage = null;
	loadedImages = false;

	constructor(creator) {
		super(creator, {
			name: 'rank',
			description: 'Sends the rank card',
			guildIDs: ['825168243043336253'],
		});
	}

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async run(ctx) {
		await this.loadImagesOnce();
		const pfp = await resolveImage((await ctx.getUser()).avatar);

		const card = new Canvas(900, 380)
			.printImage(this.bgImage, 0, 0, 900, 380)
			.printText('TEST', 365, 45, 425)
			.setColor('#FF0000')
			.createRoundedPath(190, 305, 485, 42, 21)
			.printImage(this.pfpDropImage, 0, 0)
			.printImage(pfp, 30, 30, 270, 270)
			.printText('REPUTATION', 385, 260)
			.printText('LEVEL', 385, 215)
			.printText('69', 850, 260)
			.printText('420', 850, 215);

		fs.writeFile('./img.png', await card.toBufferAsync());
	}

	async loadImagesOnce() {
		if (this.loadedImages) return;

		const assetDir = join(__dirname, '..', '..', 'assets');
		this.bgImage = await resolveImage(join(assetDir, 'images', 'usercard', 'card_bg.png'));
		this.pfpDropImage = await resolveImage(join(assetDir, 'images', 'usercard', 'card_pfp_drop.png'));
		this.loadedImages = true;
	}
}

module.exports = RankCommand;
