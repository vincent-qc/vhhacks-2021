const Command = require('../structures/Command');
const { CommandOptionType } = require('slash-create');

class SetRepCommand extends Command {
	constructor(creator) {
		super(creator, {
			name: 'set-rep',
			description: 'Sets the reputation of a user.',
			options: [
				{
					type: CommandOptionType.USER,
					name: 'user',
					description: 'The user to set the reputation of',
					required: true,
				},
				{
					type: CommandOptionType.INTEGER,
					name: 'reputation',
					description: "What to set the user's reputation to",
					required: true,
				},
			],
			adminOnly: true,
			guildIDs: ['825168243043336253'],
		});
	}

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async exec(ctx) {
		const user = await ctx.fetchUserOption('user');
		const reputation = await ctx.options.reputation;

		if (reputation < 0 || reputation > 0x7fffffff) {
			return void ctx.send(
				'Sorry, the amount of reputation provided was invalid. It must be a positive integer less than 2,147,483,647.',
				{ ephemeral: true },
			);
		}

		await sql`
			INSERT INTO members (id, guild_id, color, reputation)
			VALUES (${message.author.id}, ${message.guild.id}, null, ${reputation})
			ON CONFLICT (id, guild_id)
			DO UPDATE SET reputation = ${reputation}
		`
			.then(() => ctx.send("Successfully updated the user's reputation.", { ephemeral: true }))
			.catch(() =>
				ctx.send("An error occurred when updating the user's reputation, please try again.", { ephemeral: true }),
			);
	}
}

module.exports = SetRepCommand;
