const { Command } = require('discord.js-commando');
const Redis = require('../../dataProviders/redis/Redis');
const redis = new Redis();

module.exports = class MuteUserCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'mute',
			group: 'mod',
			memberName: 'mute',
			description: 'Mutes a user.',
			guildOnly: true,

			args: [
				{
					key: 'member',
					prompt: 'What user would you like to mute?\n',
					type: 'member'
				},
				{
					key: 'reason',
					prompt: 'you must provide a reason for muting this user.\n',
					type: 'string',
					default: ''
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_MESSAGES');
	}

	async run(msg, args) {
		const member = args.member;
		const user = member.user;
		if (member.id === msg.author.id) return msg.say('I don\'t think you want to mute yourself.');
		if (user.id === this.client.user.id) return msg.reply('Please don\'t mute me :(');
		if (msg.channel.permissionsFor(args.member).hasPermission('ADMINISTRATOR')) return msg.reply('y u trynna mute an admin fam?');
		if (!msg.channel.permissionsFor(this.client.user).hasPermission('MANAGE_ROLES_OR_PERMISSIONS')) return msg.reply('I do not have the `manage roles` permission.');
		const message = await msg.channel.send('Muting user...');

		const settings = await redis.db.getAsync(`mute${msg.guild.id}`).then(JSON.parse) || [];
		if (settings.includes(member.id)) return msg.say(`The user ${member.id} is already muted.`);
		if (!msg.guild.roles.exists('name', 'Muted')) await msg.guild.createRole({ name: 'Muted', position: 0 }).then(() => msg.reply('A role `Muted` has been created. Make sure it\'s sorted correctly (ideally at the top)!'));
		settings.push(member.id);
		await redis.db.setAsync(`mute${msg.guild.id}`, JSON.stringify(settings)).catch(console.error);
		await member.addRole(msg.guild.roles.find('name', 'Muted'));
		return message.edit(`I have successfully muted ${user.username}.`);
	}
};
