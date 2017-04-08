const guildSettings = require('../dataProviders/postgreSQL/models/GuildSettings');
const starBoard = require('../dataProviders/postgreSQL/models/StarBoard');

exports.run = async (bot, channel) => {
	if (!channel || (channel && !channel.guild)) return;
	const settings = await guildSettings.findOne({ where: { guildID: channel.guild.id } });
	if (!settings) return;
	// bot.funcs.logEvent(bot, 'channelDelete');
	if (settings.nsfw && settings.nsfw.channels && settings.nsfw.channels.includes(channel.id)) {
		const nsfw = settings.nsfw;
		nsfw.channels.splice(nsfw.channels.indexOf(channel.id), 1);
		settings.nsfw = nsfw;
		await settings.save();
	}
	if (settings.logs && settings.logs.channel === channel.id) {
		const logs = settings.logs;
		delete logs.channel;
		settings.logs = logs;
		await settings.save();
	}
	if (settings.welcome && settings.welcome.public && settings.welcome.public.channel && settings.welcome.public.channel === channel.id) {
		const welcome = settings.welcome;
		delete welcome.public.channel;
		settings.welcome = welcome;
		await settings.save();
	}
	if (settings.leave && settings.leave && settings.leave.channel && settings.leave.channel === channel.id) {
		const leave = settings.leave;
		delete leave.channel;
		settings.leave = leave;
		await settings.save();
	}
	if (settings.reactions && settings.reactions.channel === channel.id) {
		const reactions = settings.reactions;
		delete reactions.channel;
		settings.reactions = reactions;
		await settings.save();
	}
	if (channel.name === 'starboard') {
		let starSettings = await starBoard.findOne({ where: { guildID: channel.guild.id } });
		if (!starSettings) return;
		starSettings = {};
		await starSettings.save();
	}
};
