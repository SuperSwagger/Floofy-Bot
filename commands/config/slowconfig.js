const { Command } = require('discord.js-commando');
const guildSettings = require('../../dataProviders/postgreSQL/models/GuildSettings');
const Redis = require('../../dataProviders/redis/Redis');
const redis = new Redis();

module.exports = class SlowConfigCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'slowconfig',
			group: 'config',
			memberName: 'slowconfig',
			description: 'Sets the slowmode settings for the server.',
			guildOnly: true,
			examples: [
				'slowconfig 3 5'
			],
			args: [
				{
					key: 'tokens',
					prompt: 'How many tokens would you like to set?\n',
					type: 'integer'
				},
				{
					key: 'cooldown',
					prompt: 'What should be the refresh time for tokens in *seconds*?\n',
					type: 'integer'
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
		slowmode.tokens = args.tokens;
		slowmode.cooldown = args.cooldown;
		settings.slowmode = slowmode;
		await redis.db.hmsetAsync(`slowmode${msg.guild.id}`, {
			tokens: args.tokens,
			cooldown: args.cooldown
		});
		await settings.save();
		return msg.reply(`I have updated the slowmode settings to ${args.tokens} messages per ${args.cooldown} seconds`);
	}
};
