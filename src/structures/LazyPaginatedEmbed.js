// @ts-check
const { MessageEmbed } = require('discord.js');

class LazyPaginatedEmbed {
	static EMOJIS = Object.freeze({
		BACKWARD: '◀️',
		STOP: '⏹️',
		FORWARD: '▶️',
	});
	static ALL_EMOJIS = Object.values(LazyPaginatedEmbed.EMOJIS);

	page = 0;
	cache = new Map();

	setStartPage(index) {
		this.page = index;
		return this;
	}

	setGenerator(generator) {
		this.generator = generator;
		return this;
	}

	setIdleTimeout(timeout) {
		this.idleTimeout = timeout;
		return this;
	}

	async start(msg, userID) {
		for (const emoji of LazyPaginatedEmbed.ALL_EMOJIS) await msg.react(emoji);
		const collector = await msg.createReactionCollector(
			(reaction, user) => LazyPaginatedEmbed.ALL_EMOJIS.includes(reaction.emoji.name) && user.id === userID,
			{
				idle: this.idleTimeout,
			},
		);

		let last = -1;
		collector.on('collect', async (reaction, user) => {
			// very scuffed throttling thingy to make sure users don't spam the thing :P
			const now = Date.now();
			if (now - last < 1500) return;
			last = now;

			switch (reaction.emoji.name) {
				case LazyPaginatedEmbed.EMOJIS.BACKWARD: {
					if (this.page === 0) return;
					const cacheEmbed = this.cache.get(this.page - 1);
					const embed = cacheEmbed ?? (await this.generator(this.page - 1));
					if (!cacheEmbed) this.cache.set(this.page - 1, cacheEmbed);
					if (!embed) return reaction.users.remove(user);

					--this.page;
					msg.edit(embed);
					return reaction.users.remove(user);
				}
				case LazyPaginatedEmbed.EMOJIS.STOP: {
					msg.reactions.removeAll();
					return collector.stop();
				}
				case LazyPaginatedEmbed.EMOJIS.FORWARD: {
					const cacheEmbed = this.cache.get(this.page + 1);
					const embed = cacheEmbed ?? (await this.generator(this.page + 1));
					if (!cacheEmbed) this.cache.set(this.page + 1, cacheEmbed);
					if (!embed) return reaction.users.remove(user);

					++this.page;
					msg.edit(embed);
					return reaction.users.remove(user);
				}
			}
		});
	}
}

module.exports = LazyPaginatedEmbed;
