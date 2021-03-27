// @ts-check
const { CommandOptionType } = require('slash-create');
const Command = require('../structures/Command');
const { inspect } = require('util');

class EvalCommand extends Command {
	constructor(creator) {
		super(creator, {
			name: 'eval',
			description: 'Evaluates arbitrary JavaScript code',
			options: [
				{
					type: CommandOptionType.STRING,
					name: 'code',
					description: 'Code to evaluate',
					required: true,
				},
				{
					type: CommandOptionType.BOOLEAN,
					name: 'async',
					description: 'Whether the code should be interpreted as async',
					default: false,
				},
				{
					type: CommandOptionType.BOOLEAN,
					name: 'silent',
					description: 'Whether or not command execution should be silent',
					default: false,
				},
			],
			ownerOnly: true,
			guildIDs: ['825168243043336253'],
		});
	}

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async run(ctx) {
		const { async, silent } = ctx.options;
		const code = async
			? `(async () => {
			${ctx.options.code}
		})();`
			: ctx.options.code;

		const start = process.hrtime.bigint();
		try {
			// @ts-expect-error
			let result = eval(code);
			const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
			ctx.send(`**Output:**${await this.process(result)}\n⏱️ ${elapsedMs.toFixed(5)}ms`);
		} catch (error) {
			const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
			ctx.send(
				`**Error:**\n${await this.process(Reflect.has(error, 'stack') ? error.stack : error)}\n⏱️ ${elapsedMs.toFixed(
					5,
				)}ms`,
			);
		}
	}

	async process(text) {
		if (text?.constructor.name === 'Promise') text = await text;
		if (typeof text !== 'string') text = inspect(text);

		const cleaned = text.replaceAll(this.client.token, '[token]').replaceAll('`', '`\u200b');
		const result = `\`\`\`js\n${cleaned}\n\`\`\``;
		if (result.length > 1900) return `${result.slice(0, 1900)}...`;
		return result;
	}
}

module.exports = EvalCommand;