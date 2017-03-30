const { Command } = require('discord.js-commando');

module.exports = class BanUserCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'softban',
			group: 'mod',
			memberName: 'softban',
			description: 'Softbans a user.',
			guildOnly: true,

			args: [
				{
					key: 'user',
					prompt: 'What user would you like to softban?\n',
					type: 'user'
				},
				{
					key: 'reason',
					prompt: 'Please provide a reason for softbanning this user.\n',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('KICK_MEMBERS');
	}

	async run(msg, args) {
		const user = args.user;
		if (!msg.channel.permissionsFor(this.client.user).hasPermission('BAN_MEMBERS')) return msg.reply('I do not have the `ban members` permission.');
		if (user.id === this.client.user.id) return msg.reply('Please don\'t softban me :(');
		const member = await msg.guild.fetchMember(args.user);
		if (!member.bannable) return msg.reply('I am unable to softban this user, please ensure my highest role is above the target user\'s highest role!');

		const message = await msg.channel.send('Softbanning user...');

		await msg.guild.ban(user, 7).then(() => msg.guild.unban(user));
		return message.edit(`${args.user.username}#${args.user.discriminator} was softbanned.`);
	}
};
