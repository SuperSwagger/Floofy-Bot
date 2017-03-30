const { Command } = require('discord.js-commando');
const guildSettings = require('../../dataProviders/postgreSQL/models/GuildSettings');
const Redis = require('../../dataProviders/redis/Redis');
const redis = new Redis();

module.exports = class ToggleSlowmodeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'toggleslow',
			group: 'config',
			memberName: 'toggleslow',
			description: 'Enables or disables slowmode.',
			guildOnly: true,
			examples: [
				'toggleslow true'
			],
			args: [
				{
					key: 'enabled',
					prompt: `Would you like to enable or disable slowmode?`,
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
		const slowmode = settings.slowmode;
		slowmode.enabled = args.enabled;
		settings.filter = slowmode;
		await redis.db.hmsetAsync(`slowmode${msg.guild.id}`, { enabled: JSON.stringify(args.enabled) });
		await settings.save();
		return msg.reply(`Slowmode has been ${args.enabled ? 'enabled' : 'disabled'}.`);
	}
};
