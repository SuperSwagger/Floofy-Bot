const { Command } = require('discord.js-commando');
const guildSettings = require('../../dataProviders/postgreSQL/models/GuildSettings');

module.exports = class ListAvailableRolesCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'lar',
			group: 'info',
			memberName: 'lar',
			description: 'Get a list of self-assignable roles for the server.',
			guildOnly: true
		});
	}

	async run(msg) {
		const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } });
		if (!settings || settings.flairs.roles.length === 0) return msg.reply('there are no settings associated with this guild...😦');
		return msg.say(msg.guild.roles.filter(role => settings.flairs.roles.includes(role.id)).map(role => `\`${role.name}\``).sort().join(', '));
	}
};
