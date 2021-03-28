// @ts-check
class LazyPaginatedEmbed {
	static EMOJIS = Object.freeze({
		BACKWARD: '◀️',
		STOP: '⏹️',
		FORWARD: '▶️',
		JUMP_TO: '🧮',
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

	/** @param {import('discord.js').TextChannel} channel */
	async start(channel, userID) {
		const initEmbed = await this.generator(this.page);
		if (!initEmbed) throw new Error(`First page returned from LazyPaginatedEmbed#generator() was undefined.`);

		const msg = await channel.send(initEmbed);
		for (const emoji of LazyPaginatedEmbed.ALL_EMOJIS) await msg.react(emoji);

		const collector = await msg.createReactionCollector(
			(reaction, user) => LazyPaginatedEmbed.ALL_EMOJIS.includes(reaction.emoji.name) && user.id === userID,
			{
				idle: this.idleTimeout,
			},
		);

		collector.on('collect', async (reaction) => {
			switch (reaction.emoji.name) {
				case LazyPaginatedEmbed.EMOJIS.BACKWARD: {
					if (this.page === 0) return;
					const embed = await this.generator(this.page - 1);
					if (!embed) return;

					--this.page;
					msg.edit(embed);
				}
			}
		});
	}
}

module.exports = LazyPaginatedEmbed;
