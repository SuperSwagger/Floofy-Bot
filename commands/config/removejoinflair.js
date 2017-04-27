const { Command } = require('discord.js-commando');
const guildSettings = require('../../dataProviders/postgreSQL/models/GuildSettings');
const types = ['bots', 'users'];

module.exports = class AddJoinFlairCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'removejoinflair',
			group: 'config',
			memberName: 'removejoinflair',
			description: 'Removes a role from the list of roles automatically assigned on join.',
			guildOnly: true,
			examples: [
				'joinflair frens'
			],
			args: [
				{
					key: 'role',
					prompt: 'What role would you like to remove from the list of roles automatically assigned on join?\n',
					type: 'role'
				},
				{
					key: 'type',
					prompt: `What member group would you like this role to be removed from? (\`${types.join(', ')}\`)\n`,
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_GUILD');
	}

	async run(msg, args) {
		const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
		if (!settings.joinflairs) settings.joinflairs = {};
		const flairs = settings.joinflairs;
		if (!flairs[args.type]) flairs[args.type] = {};
		if (!flairs[args.type].roles) flairs[args.type].roles = [];
		if (!flairs[args.type].roles.includes(args.role.id)) return msg.reply('This role is not on the list of roles!');
		flairs[args.type].roles.slice(args.role.id, 1);
		settings.flairs = flairs;
		await settings.save();
		return msg.reply(`I have removed ${args.role.name} from the list of roles automatically assigned on join for ${args.type}.`);
	}
};
