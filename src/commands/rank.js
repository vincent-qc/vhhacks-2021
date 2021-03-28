// @ts-check
const Command = require('../structures/Command');
const { Canvas, resolveImage } = require('canvas-constructor');
const { join } = require('path');
const { registerFont } = require('canvas');
const { CommandOptionType } = require('slash-create');
const sql = require('../database');

class RankCommand extends Command {
	static DEFAULT_COLOR = 'd91208';

	constructor(creator) {
		super(creator, {
			name: 'rank',
			description: "Displays a user's rank card",
			options: [
				{
					type: CommandOptionType.USER,
					name: 'user',
					description: 'The user whose profile you wish to view',
					required: false,
				},
			],
			guildIDs: ['825168243043336253'],
		});
	}

	bgImage = null;
	pfpDropImage = null;
	loadedAssets = false;

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async exec(ctx) {
		await ctx.send('<a:loading:825489363831357460> Generating the rank card...', { ephemeral: true });
		const user = (await ctx.fetchUserOption('user')) ?? (await ctx.fetchUser());

		await this.loadAssetsOnce();
		const pfp = await resolveImage(user.displayAvatarURL({ format: 'png', size: 2048 }));
		const results = await sql`
			SELECT color
			FROM members
			WHERE
				id = ${user.id} AND
				guild_id = ${ctx.guildID}
			`;

		const color = '#' + (results[0]?.color?.toString(16).padStart(6, 0) ?? RankCommand.DEFAULT_COLOR);

		const currentRep = await sql`
			SELECT reputation
			FROM members
			WHERE
				id = ${user.id} AND
				guild_id = ${ctx.guildID}
			`;

		const totalRep = 100; // For Now

		const barLength = (currentRep / totalRep) * 400 + 20;

		const card = await new Canvas(900, 380)
			.printImage(this.bgImage, 0, 0, 900, 380) // Background
			.setColor('#232323')
			.beginPath() // Create Bar BG
			.createRoundedPath(338, 301, 530, 52, 50)
			.fill()
			.setColor(color)
			.beginPath() // Create Bar FILL
			.createRoundedPath(346, 309, 514, 36, 40)
			.fill()
			.printImage(this.pfpDropImage, 0, 0) // PFPDrop
			.setTextFont('52px Geometos')
			.setColor('#FFFFFF')
			.measureText(user.username, (size, inst) => {
				inst.printResponsiveText(user.username, 354, 80, 440);
			})
			.setTextSize(48)
			.measureText('#1', (size, inst) => {
				inst.printText('#1', 840 - size.width, 76);
			})
			.setTextSize(28)
			.setColor('#d5d5d5')
			.printText('REPUTATION', 380, 260) // Other Stats
			.printText('LEVEL', 380, 215)
			.measureText('69', (size, inst) => {
				inst.printText('69', 840 - size.width, 260);
			})
			.measureText('420', (size, inst) => {
				inst.printText('420', 840 - size.width, 215);
			})
			.createCircularClip(190, 190, 150) // Clip + PFP
			.printImage(pfp, 40, 40, 300, 300)
			.toBufferAsync();

		await ctx.sendFollowUp({ content: `Rank card for **${user.tag}:**`, file: { name: 'card.png', file: card } });
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

module.exports = RankCommand;
