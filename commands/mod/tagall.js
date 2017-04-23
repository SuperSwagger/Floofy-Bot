const { Command } = require('discord.js-commando');

module.exports = class KickUserCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tagall',
			group: 'mod',
			memberName: 'tagall',
			description: 'Mentions everyone in the channel..',
			guildOnly: true
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_MESSAGES');
	}

	async run(msg) {
		return msg.channel.send(msg.guild.members.filter(mem => msg.channel.permissionsFor(mem).hasPermission('READ_MESSAGES') && !this.client.funcs.isStaff(mem)).map(mem => mem.toString()), { split: true }).catch(console.error);
	}
};
