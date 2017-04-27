const { Command } = require('discord.js-commando');
const guildSettings = require('../../dataProviders/postgreSQL/models/GuildSettings');

module.exports = class ToggleJoinFlairCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'togglejoinflair',
			group: 'config',
			memberName: 'togglejoinflair',
			description: 'Enables or disables automatic role assignment on join.',
			guildOnly: true,
			examples: [
				'togglejoinflair true'
			],
			args: [
				{
					key: 'enabled',
					prompt: 'Would you like to enable it or disable it?\n',
					type: 'boolean'
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_GUILD');
	}

	async run(msg, args) {
		const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
		const join = settings.joinflairs;
		join.enabled = args.enabled;
		settings.joinflairs = join;
		await settings.save();
		return msg.reply(`Join flairs have been ${args.enabled ? 'enabled' : 'disabled'}.`);
	}
};
