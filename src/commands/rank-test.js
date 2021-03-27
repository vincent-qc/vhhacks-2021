// @ts-check
const { Canvas, resolveImage } = require('canvas-constructor');
const { registerFont } = require('canvas');
const fs = require('fs/promises');
const { join } = require('path');

class RankCommand {
	// Lazy load bg + pfp drop image once
	bgImage = null;
	pfpDropImage = null;
	loadedAssets = false;

	async run() {
		await this.loadAssetsOnce();
		const pfp = await resolveImage(
			'https://cdn.discordapp.com/avatars/585653754888716290/21aa44bebc7e4502b0182c288500bf26.png?size=1024',
		);

		const card = new Canvas(900, 380)
			.printImage(this.bgImage, 0, 0, 900, 380) // Background
			.setColor('#131313')
			.beginPath() // Create Bar BG
			.createRoundedPath(190, 305, 630, 40, 40)
			.fill()
			.setColor('#DD0000')
			.beginPath() // Create Bar FILL
			.createRoundedPath(190, 305, 400, 40, 40)
			.fill()
			.printImage(this.pfpDropImage, 0, 0) // PFPDrop
			.setTextFont('60px Geometos')
			.setColor('#FFFFFF')
			.measureText('Crabo_', (size, inst) => {
				inst.printResponsiveText('Crabo_', 330, 60, 470);
			})
			.setTextSize(38)
			.printText('#1', 835, 45)
			.setTextSize(28)
			.printText('REPUTATION', 380, 260) // Other Stats
			.printText('LEVEL', 380, 215)
			.measureText('69', (size, inst) => {
				inst.printText('69', 880 - size.width, 260);
			})
			.measureText('420', (size, inst) => {
				inst.printText('420', 880 - size.width, 215);
			})
			.createCircularClip(190, 190, 165) // Clip + PFP
			.printImage(pfp, 25, 25, 330, 330);

		fs.writeFile(join(__dirname, 'img.png'), await card.toBufferAsync());
	}

	async loadAssetsOnce() {
		if (this.loadedAssets) return;

		const assetDir = join(__dirname, '..', '..', 'assets');
		this.bgImage = await resolveImage(join(assetDir, 'images', 'usercard', 'card_bg.png'));
		this.pfpDropImage = await resolveImage(join(assetDir, 'images', 'usercard', 'card_pfp_drop.png'));

		registerFont(join(assetDir, 'fonts', 'Geometos', 'Geometos.ttf'), { family: 'Geometos' });

		this.loadedAssets = true;
	}
}

new RankCommand().run();
