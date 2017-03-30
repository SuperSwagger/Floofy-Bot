const { Command } = require('discord.js-commando');

module.exports = class KickUserCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'kick',
			aliases: ['k'],
			group: 'mod',
			memberName: 'kick',
			description: 'Kick a user from the server.',
			guildOnly: true,

			args: [
				{
					key: 'member',
					prompt: 'What user would you like to kick?\n',
					type: 'member'
				},
				{
					key: 'reason',
					prompt: 'What are you kicking this user for?\n',
					type: 'string',
					default: ''
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('KICK_MEMBERS');
	}

	async run(msg, args) {
		const member = args.member;
		if (member.user.id === this.client.user.id) return msg.reply('Please don\'t softban me :(');
		const botMember = await msg.guild.fetchMember(this.client.user);
		if (!botMember.hasPermission('KICK_MEMBERS')) return msg.reply('I do not have the `kick members` permission.');
		if (!args.member.kickable) return msg.reply('I am unable to kick this user, please ensure my highest role is above the target user\'s highest role!');

		const message = await msg.channel.send('Kicking user...');

		await member.kick();
		return message.edit(`${args.member.user.username}#${args.member.user.discriminator} was kicked.`);
	}
	// go to mod logs
};
