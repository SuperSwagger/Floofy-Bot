const { Command } = require('discord.js-commando');
const config = require('../../settings');
const { stripIndents } = require('common-tags');

module.exports = class UserInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'invite',
			aliases: ['join'],
			group: 'info',
			memberName: 'invite',
			description: 'Provides a link to invite the bot.'
		});
	}

	async run(message) {
		return message.channel.send(stripIndents`
      To add ${this.client.user} to your server:
      https://discordapp.com/oauth2/authorize?&client_id=${config.owner}&scope=bot&permissions=${this.client.funcs.botPermissions(this.client)}
      Bot Server: https://discord.gg/0yUWR2OBEc62vtFU
      Feel free to ask questions about the bot, or even coding in general in the Bot Server! You can also chill and chat if you'd like.`);
	}
};
