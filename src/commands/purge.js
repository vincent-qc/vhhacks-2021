// @ts-check
const Command = require('../structures/Command');
const { CommandOptionType } = require('slash-create');
const { ms } = require('@naval-base/ms');

const RE2 = require('re2');

const Emojis = require('../emojis');

class PurgeCommand extends Command {
	constructor(creator) {
		super(creator, {
			name: 'purge',
			description: 'Purge messages based on some criteria',
			adminOnly: true,
			options: [
				{
					name: 'amount',
					type: CommandOptionType.INTEGER,
					description: 'Number of messages to clear, between 0 and 100',
					required: true,
				},
				{
					name: 'user',
					type: CommandOptionType.USER,
					description: 'User to filter messages by',
					required: false,
				},
				{
					name: 'min-age',
					type: CommandOptionType.STRING,
					description: 'Minimum age of messages to be considered for deletion',
					required: false,
				},
				{
					name: 'max-age',
					type: CommandOptionType.STRING,
					description: 'Maximum age of messages to be considered for deletion',
					required: false,
				},
				{
					name: 'regex',
					type: CommandOptionType.STRING,
					description: 'Regular expression to filter messages by',
					required: false,
				},
				{
					name: 'regex-case-insensitive',
					type: CommandOptionType.BOOLEAN,
					description: 'Whether the regular expression should be case-insensitive',
					required: false,
				},
			],
		});
	}

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async exec(ctx) {
		await ctx.defer(true);

		const { amount } = ctx.options;
		if (amount <= 0 || amount > 100) {
			await ctx.send(`${Emojis.ERROR} The amount of messages to purge provided was invalid. Please try again.`, {
				ephemeral: true,
			});
			return;
		}

		if (Object.keys(ctx.options).length === 1 && typeof amount === 'number') {
			return void ctx.channel
				.bulkDelete(amount, true)
				.then((msgs) => ctx.send(`${Emojis.CHECK} Purged ${msgs.size} messages!`, { ephemeral: true }))
				.catch((error) => {
					console.log('Error bulk deleting messages:', error);
					return ctx.send(`${Emojis.ERROR} An error occurred while purging the messages. Please try again.`, {
						ephemeral: true,
					});
				});
		}

		let maxAge = Infinity;
		if (Reflect.has(ctx.options, 'max-age')) {
			const parsed = ms(ctx.options['max-age']);
			if (!parsed) {
				ctx.send(
					`${Emojis.ERROR} The duration provided as the max age for messages was invalid. Please try again with a valid duration.`,
					{ ephemeral: true },
				);
				return;
			}

			maxAge = parsed;
		}

		let minAge = 0;
		if (Reflect.has(ctx.options, 'min-age')) {
			const parsed = ms(ctx.options['min-age']);
			if (!parsed) {
				ctx.send(
					`${Emojis.ERROR} The duration provided as the min age for messages was invalid. Please try again with a valid duration.`,
					{ ephemeral: true },
				);
				return;
			}

			minAge = parsed;
		}

		let regex = null;
		if (Reflect.has(ctx.options, 'regex')) {
			try {
				regex = new RE2(ctx.options.regex, ctx.options['regex-case-insensitive'] ? 'i' : '');
			} catch (error) {
				ctx.send(`${Emojis.ERROR} The regular expression provided was invalid. Please try again with a valid one.`, {
					ephemeral: true,
				});
				return;
			}
		}

		const toDelete = [];
		const now = Date.now();
		let before = undefined;
		// Fetch 500 messages
		for (let i = 0; i < 5; i++) {
			const messages = await ctx.channel.messages.fetch({ limit: 100, before });
			for (const message of messages.values()) {
				const age = now - message.createdTimestamp;

				// 1209590000 mlliseconds is just under 14 days, the maximum age for messages Discord allows us to delete.
				// It's slightly lower just to stay on the safe side.
				if (
					age >= 1209590000 ||
					age <= minAge ||
					age >= maxAge ||
					!regex?.test(message.content) ||
					(ctx.options.user && message.author.id !== ctx.options.user)
				)
					continue;
				toDelete.push(message.id);
			}

			before = messages.last().id;
		}

		await ctx.channel
			.bulkDelete(toDelete)
			.then((msgs) => ctx.send(`${Emojis.CHECK} Purged \`${msgs.size}\` messages!`, { ephemeral: true }))
			.catch((error) => {
				console.log('Error bulk deleting messages:', error);
				return ctx.send(`${Emojis.ERROR} An error occurred while purging the messages. Please try again.`, {
					ephemeral: true,
				});
			});
	}
}

module.exports = PurgeCommand;
