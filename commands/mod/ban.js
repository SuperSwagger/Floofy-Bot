const { Command } = require('discord.js-commando');

module.exports = class BanUserCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ban',
			aliases: ['b', 'banne', 'b&'],
			group: 'mod',
			memberName: 'ban',
			description: 'Permanently ban a user from the server.',
			guildOnly: true,

			args: [
				{
					key: 'user',
					prompt: 'What user would you like to ban?\n',
					type: 'user'
				},
				{
					key: 'reason',
					prompt: 'Please provide a reason for banning this user.\n',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('BAN_MEMBERS');
	}

	async run(msg, args) { // eslint-disable-line consistent-return
		const user = args.user;
		if (user.id === this.client.user.id) return msg.reply('Please don\'t ban me :(');
		if (!msg.channel.permissionsFor(this.client.user).hasPermission('BAN_MEMBERS')) return msg.reply('I do not have the `ban members` permission.');
		const member = await msg.guild.fetchMember(args.user).catch(() => null);
		if (member && this.client.funcs.isStaff(member)) return msg.reply('you cannnot ban a fellow staff member.');

		await msg.say('Are you sure you want to ban this user?  (__y__es or __n__o)');
		await msg.embed({
			author: {
				name: `${user.username}#${user.discriminator} (${user.id})`,
				icon_url: user.avatarURL // eslint-disable-line camelcase
			},
			fields: [
				{
					name: 'Reason',
					value: args.reason
				}
			],
			timestamp: new Date()
		});

		msg.channel.awaitMessages(response => ['y', 'yes', 'n', 'no', 'cancel'].includes(response.content) && response.author.id === msg.author.id, {
			max: 1,
			time: 30000
		}).then(async (co) => { // eslint-disable-line consistent-return
			if (['yes', 'y'].includes(co.first().content)) {
				const message = await msg.channel.send('Banning user...');


				await msg.guild.ban(user, 7);
				return message.edit(`${user.username}#${user.discriminator} was banned.`);
			} else if (['n', 'no', 'cancel'].includes(co.first().content)) {
				return msg.say('Got it, I won\'t ban the user.');
			}
		}).catch(() => msg.say('Aborting ban, took longer than 30 seconds to reply.'));
	}
};
