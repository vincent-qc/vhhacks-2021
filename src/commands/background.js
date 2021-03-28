// @ts-check
const Command = require('../structures/Command');
const sql = require('../database');
const { CommandOptionType } = require('slash-create');
const { imageIDs } = require('../backgrounds');

const Emojis = require('../emojis');

class BackgroundCommand extends Command {
	constructor(creator) {
		super(creator, {
			name: 'background',
			description: 'Sets the background for your rank card',
			options: [
				{
					type: CommandOptionType.INTEGER,
					name: 'image-id',
					description: 'The id of the background',
					choices:
						imageIDs.length <= 25
							? imageIDs.map((id) => ({ name: `background-${id.toString()}`, value: id }))
							: undefined,
					required: true,
				},
			],
		});
	}

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async exec(ctx) {
		const id = ctx.options['image-id'];
		console.log(id);
		if (!imageIDs.includes(id)) {
			await ctx.send(
				`${Emojis.ERROR} Invalid background ID supplied. Check out a list of valid ones using the \`view-backgrounds\` command.`,
				{ ephemeral: true },
			);
			return;
		}

		await sql`
			INSERT INTO members (id, guild_id, color, background, reputation)
			VALUES (${ctx.userID}, ${ctx.guildID}, null, ${id}, null)
			ON CONFLICT (id, guild_id)
			DO UPDATE SET background = EXCLUDED.background
		`
			.then(() => ctx.send(`${Emojis.CHECK} Successfully updated your background image.`, { ephemeral: true }))
			.catch((error) => {
				console.log('Error updating user rank card background:', error);
				return ctx.send(`${Emojis.ERROR} An error occurred while updating your background image, please try again.`, {
					ephemeral: true,
				});
			});
	}
}

module.exports = BackgroundCommand;
