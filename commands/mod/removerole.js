const { Command } = require('discord.js-commando');

module.exports = class RemoveRoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'removerole',
			aliases: ['rr', 'rrole'],
			group: 'mod',
			memberName: 'removerole',
			description: 'Removes a role from a user.',
			guildOnly: true,

			args: [
				{
					key: 'member',
					prompt: 'What user would you like to remove the role from??\n',
					type: 'member'
				},
				{
					key: 'role',
					prompt: 'What role would you like to remove from the user?\n',
					type: 'role'
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS');
	}

	async run(msg, args) {
		const member = args.member;
		const user = member.user;
		const role = args.role;
		const botMember = await msg.guild.fetchMember(msg.client.user);
		if (!botMember.hasPermission('MANAGE_ROLES_OR_PERMISSIONS')) return msg.reply('I do not have the `manage roles` permission.');
		// const role = message.guild.roles.filter(ro => ro.name.toLowerCase() === role.toLowerCase()).first();
		if (!member.roles.has(role.id)) return msg.reply('the target user doesn\'t even have that role!');
		if (botMember.highestRole.comparePositionTo(role) < 1) return msg.reply('I do not have permissions to edit this role, please check role order!');
		if (msg.member.highestRole.comparePositionTo(args.role) < 1) return msg.reply('you do not have access to this role, please check role order!');
		await member.removeRole(args.role);
		return msg.reply(`I have removed ${role.name} from ${user.username}.`);
	}
};
