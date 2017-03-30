const { stripIndents } = require('common-tags');

exports.run = (bot, server) => {
	bot.funcs.logEvent(bot, 'guildCreate');
	const blacklist = bot.provider.get('global', 'userBlacklist', []);
	if (blacklist.includes(server.ownerID)) return server.leave();
	bot.fetchUser(server.ownerID).then(user => {
		bot.channels.get('189630078206869505').sendMessage(stripIndents`Joined ${server.name.replace(/@(everyone|here)/g, '@\u200b$1')}
		Server ID: ${server.id}
		Owner: ${user.username} (${user.id})
		Mention: ${user}
		`);
	});
};
