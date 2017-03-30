const { Command } = require('discord.js-commando');
const guildSettings = require('../../dataProviders/postgreSQL/models/GuildSettings');
const Redis = require('../../dataProviders/redis/Redis');
const redis = new Redis();

module.exports = class ToggleAdFilterCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'toggleads',
			group: 'config',
			memberName: 'toggleads',
			description: 'Enables or disables the filter for Discord invite links.',
			guildOnly: true,
			examples: [
				'toggleads true'
			],
			args: [
				{
					key: 'enabled',
					prompt: `Would you like to enable or disable the ad filter?`,
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
		settings.adFilter = args.enabled;
		await redis.db.setAsync(`invitefilter${msg.guild.id}`, JSON.stringify(args.enabled)).catch(console.error);
		await settings.save().catch(console.error);
		return msg.reply(`The filtering of Discord links has been ${args.enabled ? 'enabled' : 'disabled'}.`);
	}
};
