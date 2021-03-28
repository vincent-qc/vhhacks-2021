// @ts-check
const Command = require('../structures/Command');
const sql = require('../database');
const { CommandOptionType } = require('slash-create');

const toHex = require('colornames');

class ColorCommand extends Command {
	constructor(creator) {
		super(creator, {
			name: 'color',
			description: 'Modifies the color used for your rank card',
			options: [
				{
					type: CommandOptionType.STRING,
					name: 'color',
					description: 'The color to use for your rank card, hex or color name',
					required: true,
				},
			],
			guildIDs: ['825168243043336253'],
		});
	}

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async exec(ctx) {
		// @ts-expect-error
		let raw = ctx.options.color.trim();
		const hex = toHex(raw) ?? raw;
		if (!/^#?[\da-f]{1,6}$/i.test(hex)) {
			return void ctx.send("That wasn't a valid color, please try again.", { ephemeral: true });
		}

		const color = hex.startsWith('#') ? parseInt(hex.slice(1), 16) : parseInt(hex, 16);

		await sql`
			INSERT INTO members (id, guild_id, color, background, reputation)
			VALUES (${ctx.userID}, ${ctx.guildID}, ${color}, null, 0)
			ON CONFLICT (id, guild_id)
			DO UPDATE SET color = ${color}
        `
			.then(() => {
				ctx.send(
					`Successfully changed your rank card color to ${
						hex.startsWith('#') ? hex.toUpperCase() : '#' + hex.toUpperCase()
					}!`,
					{ ephemeral: true },
				);
			})
			.catch((error) => {
				console.log('Error changing rank card color:', error);
				ctx.send('An error occurred while changing your rank card color, please try again.', { ephemeral: true });
			});
	}
}

module.exports = ColorCommand;
