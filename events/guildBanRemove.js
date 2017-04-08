const guildSettings = require('../dataProviders/postgreSQL/models/GuildSettings');

exports.run = async (bot, server, user) => {
  // unbans
	const settings = await guildSettings.findOne({ where: { guildID: server.id } });
	if (!settings) return;
	// bot.funcs.logEvent(bot, 'guildBanRemove');
	const logs = settings.logs;
	if (logs && logs.enabled && logs.channel && (logs.fields ? logs.fields.bans !== false : !logs.fields) && server.channels.has(logs.channel)) {
		// might change colour to lime green
		const embed = new bot.methods.Embed()
		.setColor('#66ff99')
		.setTimestamp(new Date())
		.setAuthor(`${user.username} (${user.id})`, user.avatarURL)
		.addField('\u2705 UNBAN', `${user.username} has been unbanned from the server.`)
		.setFooter(bot.user.username, bot.user.avatarURL);
		await server.channels.get(logs.channel).sendEmbed(embed);
	}

	server = null;
	user = null;
};
