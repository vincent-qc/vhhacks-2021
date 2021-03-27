const { SlashCommand, CommandOptionType, CommandContext } = require('slash-create');

class EvalCommand extends SlashCommand {
	constructor(creator) {
		super(creator, {
			name: 'eval',
			description: 'Evaluates arbitrary JavaScript code',
			options: [
				{
					type: CommandOptionType.STRING,
					name: 'code',
					description: 'Code to evaluate',
				},
			],
		});
	}

	/** @param ctx {CommandContext} */
	async run(ctx) {
		const member = ctx.user;
	}
}
