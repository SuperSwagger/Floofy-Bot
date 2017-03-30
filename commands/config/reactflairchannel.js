const { Command } = require('discord.js-commando');
const guildSettings = require('../../dataProviders/postgreSQL/models/GuildSettings');

module.exports = class ReactFlairChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reactflairchannel',
			group: 'config',
			memberName: 'reactflairchannel',
			description: 'Sets the channel for automatic role assignment by reactions',
			guildOnly: true,
			examples: [
				'reactflairchannel flair_channel'
			],
			args: [
				{
					key: 'channel',
					prompt: 'What channel would you like to set?\n',
					type: 'channel'
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_GUILD');
	}

	async run(msg, args) {
		const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
		let reactions = settings.reactions;
		reactions.channel = args.channel.id;
		settings.reactions = reactions;
		await settings.save().catch(console.error);
		return msg.reply(`I have successfully set ${args.channel} as the channel for automatic role assignment by reactions.`);
	}
};
