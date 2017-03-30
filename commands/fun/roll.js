const { Command } = require('discord.js-commando');

module.exports = class RollDiceCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'roll',
			group: 'fun',
			memberName: 'roll',
			description: 'Roll for a number',
			examples: ['roll 10'],

			args: [
				{
					key: 'max',
					prompt: 'Please provide a maximum roll range above 1.',
					type: 'integer',
					validate: (int) => {
						return int > 1;
					}
				}
			]
		});
	}

	async run(msg, args) {
		return msg.reply(`rolled ${Math.floor(Math.random() * (args.max - 1)) + 1}`);
	}
};
