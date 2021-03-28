const Command = require('../structures/Command');
const { CommandOptionType } = require('slash-create');

class LeaderboardCommand extends Command {
	constructor(creator) {
		super(creator, {
			name: 'leaderboard',
			description: 'Displays the reputation leaderboard of the server',
			options: [
				{
					type: CommandOptionType.INTEGER,
					name: 'page',
					description: 'The page to view in the leaderboard',
					required: false,
				},
			],
		});
	}

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async exec(ctx) {
		const { page } = ctx.options;

		if (page < 0 || page > 500_000) {
			await ctx.send("That's not a valid page, please try again.", { ephemeral: true });
			return;
		}

		// Show 10 per page
		const start = ctx.options.page * 10;
	}
}

module.exports = LeaderboardCommand;
