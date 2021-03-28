// @ts-check
const Command = require('../structures/Command');
const { Canvas, resolveImage } = require('canvas-constructor');
const { join } = require('path');
const { registerFont } = require('canvas');
const { CommandOptionType } = require('slash-create');
const sql = require('../database');
const { getReputation, getLevel, formatInt } = require('../utils');
const { loadBackground, imageIDs } = require('../backgrounds');

const Emojis = require('../emojis');

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
		});
	}

	bgImages = {};
	loadedAssets = false;

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async exec(ctx) {
		const user = (await ctx.fetchUserOption('user')) ?? (await ctx.fetchUser());
		if (user.bot) return ctx.send('The user is a bot. Please provide an actual user.', { ephemeral: true }); // Check for bot

		const msg = await ctx.send(`${Emojis.LOADING} Generating the rank card...`);

		await this.loadAssetsOnce();
		const pfp = await resolveImage(user.displayAvatarURL({ format: 'png', size: 2048 }));

		const results = await sql`
			SELECT reputation, position, color, background FROM (
				SELECT id, reputation, color, background, RANK() OVER (ORDER BY reputation DESC) AS position
				FROM members
				WHERE guild_id = ${ctx.guildID}
			) as t
			WHERE id = ${user.id}
		`;

		const backgroundID = results[0]?.background ?? 0;
		const bgImage = this.bgImages[backgroundID];

		const color = '#' + (results[0]?.color?.toString(16).padStart(6, 0) ?? RankCommand.DEFAULT_COLOR);
		const reputation = results[0]?.reputation ?? 0;
		const formattedReputation = formatInt(reputation);

		const position = results[0]?.position;
		const formattedPosition = position ? formatInt(position) : '-';

		const currentLevel = getLevel(reputation);
		const levelRep = reputation - getReputation(currentLevel);
		const totalLevelRep = getReputation(currentLevel + 1);

		const barLength = 40 + (levelRep / totalLevelRep) * 534;
		const card = await new Canvas(1000, 380)
			.createRoundedClip(0, 0, 1000, 380, 30)
			.printImage(bgImage, 0, 0, 1000, 380) // Background
			.setGlobalAlpha(0.6)
			.setColor('#101010')
			.beginPath() // Create Bar BG
			.createRoundedPath(370, 301, 590, 52, 50)
			.fill()
			.setGlobalAlpha(0.8)
			.setColor(color)
			.beginPath() // Create Bar FILL
			.createRoundedPath(378, 309, barLength, 36, 40) // Full   =>   .createRoundedPath(346, 309, 514, 36, 40)
			.fill()
			// .printImage(this.pfpDropImage, 0, 0) // PFPDrop
			.setTextFont('52px Geometos')
			.setColor('#FFFFFF')
			.printResponsiveText(user.username, 380, 80, 540)
			.setTextSize(48)
			.measureText(`#${formattedPosition}`, (size, canvas) =>
				canvas.printText(`#${formattedPosition}`, 960 - size.width, 76),
			)
			.setTextSize(28)
			.setColor('#e2e2e2')
			.printText('REPUTATION', 390, 260) // Other Stats
			.printText('LEVEL', 390, 215)
			.measureText(formattedReputation, (size, canvas) => canvas.printText(formattedReputation, 960 - size.width, 260))
			.measureText(currentLevel.toString(), (size, canvas) => {
				return canvas.printText((currentLevel + 1).toString(), 960 - size.width, 215);
			})
			// .createCircularClip(190, 190, 150)
			.setGlobalAlpha(1)
			.createRoundedClip(40, 40, 300, 300, 30) // Clip + PFP
			.printImage(pfp, 40, 40, 300, 300)
			.toBufferAsync();

		await ctx.sendFollowUp({ content: `Rank card for **${user.tag}:**`, file: { name: 'card.png', file: card } });
		
	}

	async loadAssetsOnce() {
		if (this.loadedAssets) return;

		for (const imageID of imageIDs) this.bgImages[imageID] = await loadBackground(imageID);
		registerFont(join(__dirname, '..', '..', 'assets', 'fonts', 'Geometos', 'Geometos.ttf'), {
			family: 'Geometos',
		});
		this.loadedAssets = true;
	}
}

module.exports = RankCommand;
