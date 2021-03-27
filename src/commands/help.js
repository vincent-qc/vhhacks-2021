// @ts-check
const { CommandOptionType } = require('slash-create');
const Command = require('../structures/Command');
const { inspect } = require('util');
const fs = require('fs/promises');
const Discord = require('discord.js');
const { join } = require('fs');

class HelpCommand extends Command {
	helpEmbed = null;

	constructor(creator) {
		super(creator, {
			name: 'help',
			description: 'Sends a help message',
			options: [
				{
					type: CommandOptionType.STRING,
					name: 'command',
					description: 'Code to evaluate',
					required: false,
				},
			],
			ownerOnly: false,
			guildIDs: ['825168243043336253'],
		});
	}

	/** @param ctx {import('../structures/EnhancedCommandContext')} */
	async run(ctx) {
		if (!this.helpEmbed) {
			const text = await fs.readFile(join(__dirname, '..', '..', 'assets', 'embeds', 'help.txt'), {
				encoding: 'utf8',
			});

			this.helpEmbed = new Discord.MessageEmbed()
				.setColor('#FF0000')
				.setTitle('Help')
				.setDescription('Getting help')
				.addField('List of Commands', text, true);
		}

		// TODO: Get Specific Command Help Working

		ctx.send(this.helpEmbed);
	}
}

module.exports = HelpCommand;
