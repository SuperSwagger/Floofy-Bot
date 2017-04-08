const guildSettings = require('../dataProviders/postgreSQL/models/GuildSettings');

exports.run = async (bot, oldMember, newMember) => {
  // nicknames, roles
	const settings = await guildSettings.findOne({ where: { guildID: newMember.guild.id } });
	if (!settings) return;
	// bot.funcs.logEvent(bot, 'guildMemberUpdate');
	const logs = settings.logs;
	if (logs && logs.enabled && logs.channel && newMember.guild.channels.has(logs.channel)) {
		const embed = new bot.methods.Embed()
		.setTimestamp(new Date())
		.setAuthor(`${oldMember.user.username} (${oldMember.user.id})`, oldMember.user.avatarURL)
		.setFooter(bot.user.username, bot.user.avatarURL);

		if ((logs.fields ? logs.fields.nicknames !== false : !logs.fields) && oldMember.nickname !== newMember.nickname) {
			embed.setColor('#00bbff');
			if (oldMember.nickname !== newMember.nickname) embed.addField(':wrench: NICKNAME CHANGE', `${oldMember.user.username} has changed their nickname from ${oldMember.nickname} to: ${newMember.nickname}`);
			else if (!oldMember.nickname) embed.addField('🔧 NICKNAME CHANGE', `${oldMember.user.username} has added the nickname: ${newMember.nickname}`);
			else if (!newMember.nickname) embed.addField('🔧 NICKNAME CHANGE', `${oldMember.user.username} has removed the nickname: ${oldMember.nickname}`);
			await newMember.guild.channels.get(logs.channel).sendEmbed(embed);
		}	else if (logs.fields ? logs.fields.roles !== false : !logs.fields && oldMember.roles.size !== newMember.roles.size) {
			embed.setColor('#8800bb');
			embed.addField('🔧 ROLE CHANGE', `${oldMember.user.username}'s roles have changed:\nOld: \`\u200B${oldMember.roles.map(role => role.name).join(', ').slice(11)}\`\nNew: \`\u200B${newMember.roles.map(role => role.name).join(', ').slice(11)}\``);
			await newMember.guild.channels.get(logs.channel).sendEmbed(embed);
		}
	}
};
