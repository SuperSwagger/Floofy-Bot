const { Command } = require('discord.js-commando');

module.exports = class SetRoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'setrole',
			aliases: ['sr', 'srole'],
			group: 'mod',
			memberName: 'setrole',
			description: 'Gives a user a role.',
			guildOnly: true,

			args: [
				{
					key: 'member',
					prompt: 'What user would you like to give a role to?\n',
					type: 'member'
				},
				{
					key: 'role',
					prompt: 'What role would you like to give the user?\n',
					type: 'role'
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS') || this.client.options.owner === msg.author.id;
	}

	async run(msg, args) {
		const { member, role } = args;
		const { user } = member;
		const botMember = await msg.guild.fetchMember(this.client.user);
		if (!botMember.hasPermission('MANAGE_ROLES_OR_PERMISSIONS')) return msg.reply('I do not have the `manage roles` permission.');
		// const role = msg.guild.roles.filter(ro => ro.name.toLowerCase() === role.toLowerCase()).first();
		if (member.roles.has(role.id)) return msg.reply('the target user already has that role!');
		if (botMember.highestRole.comparePositionTo(role) < 1) return msg.reply('I do not have permissions to edit this role, please check role order!');
		if (msg.member.highestRole.comparePositionTo(args.role) < 1) return msg.reply('you do not have access to this role, please check role order!');
		await member.addRole(role);
		return msg.reply(`I have added ${role.name} to ${user.username}.`);
	}
};
