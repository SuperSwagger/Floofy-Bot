const { Command } = require('discord.js-commando');
const { exec } = require('child_process');

module.exports = class ExecuteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'exec',
			aliases: ['execute'],
			group: 'util',
			memberName: 'exec',
			description: 'Executes command in the shell.',
			guildOnly: true,

			args: [
				{
					key: 'code',
					prompt: 'what would you like to execute?\n',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.options.owner === msg.author.id;
	}

	async run(msg, args) {
		exec(args.code, (err, stdout, stderr) => {
			if (err) return msg.code('', err.message);
			return msg.code('', stdout);
		});
	}
};
