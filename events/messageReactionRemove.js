const guildSettings = require('../dataProviders/postgreSQL/models/GuildSettings');
const starBoard = require('../dataProviders/postgreSQL/models/StarBoard');

exports.run = async (bot, messageReaction, user) => {
	const message = messageReaction.message;
	const starboard = message.guild.channels.find('name', 'starboard');

	if (messageReaction.emoji.name === '⭐' && starboard) {
		const settings = await starBoard.findOne({ where: { guildID: message.guild.id } });
		if (!settings) return;
		bot.funcs.logEvent(bot, 'messageReactionRemove');
		let starred = settings.starred;

		if (!starred.hasOwnProperty(message.id)) return;
		if (!starred[message.id].stars.includes(user.id)) return;

		const starCount = starred[message.id].count -= 1;
		const starredMessage = await starboard.fetchMessage(starred[message.id].starredMessageID).catch(() => null);

		if (starred[message.id].count === 0) {
			delete starred[message.id];
			await starredMessage.delete().catch(() => null);
		} else {
			const starredMessageContent = starred[message.id].starredMessageContent;
			const starredMessageAttachmentImage = starred[message.id].starredMessageImage;
			const starredMessageDate = starred[message.id].starredMessageDate;

			let edit;
			if (starCount < 5) edit = starredMessage.embeds[0].footer.text = `${starCount} ⭐`;
			else if (starCount >= 5 && starCount < 10) edit = starredMessage.embeds[0].footer.text = `${starCount} 🌟`;
			else if (starCount >= 10) edit = starredMessage.embeds[0].footer.text = `${starCount} ✨`;
			else if (starCount >= 15) edit = starredMessage.embeds[0].footer.text = `${starCount} 🌠`;

			await starredMessage.edit({
				embed: {
					author: {
						icon_url: message.author.displayAvatarURL, // eslint-disable-line camelcase
						name: `${message.author.username}#${message.author.discriminator} (${message.author.id})`
					},
					color: 0xFFAC33,
					fields: [
						{
							name: 'ID',
							value: message.id,
							inline: true
						},
						{
							name: 'Channel',
							value: message.channel.toString(),
							inline: true
						},
						{
							name: 'Message',
							value: starredMessageContent ? starredMessageContent : '\u200B'
						}
					],
					image: { url: starredMessageAttachmentImage ? starredMessageAttachmentImage : undefined },
					timestamp: starredMessageDate,
					footer: { text: edit }
				}
			}).catch(() => null);

			starred[message.id].count = starCount;
			starred[message.id].stars.splice(starred[message.id].stars.indexOf(user.id));
		}

		settings.starred = starred;
		await settings.save();
	}
	const settings = await guildSettings.findOne({ where: { guildID: message.guild.id } });

	if (!message.guild || !message.guild.member(user)) return;
	if (!settings || !settings.reactions || !settings.reactions.enabled || message.channel.id !== settings.reactions.channel) return;

	const channel = bot.channels.get(settings.reactions.channel);
	const msgs = await channel.fetchPinnedMessages().catch(err => console.error(err)) || channel.messages;
	const pinned = msgs.first().id;
	const emoji = messageReaction.emoji.hasOwnProperty('guild') ? messageReaction.emoji.id : messageReaction.emoji.name;

	if (message.id !== bot.channels.get(settings.reactions.channel).messages.first().id && messageReaction.message.id !== pinned) return;
	if (!settings.reactions.roles[settings.reactions.emojis.indexOf(emoji)]) return messageReaction.message.channel.sendMessage('There is no role assigned to this reaction!'); // eslint-disable-line consistent-return

	const role = message.guild.roles.get(settings.reactions.roles[settings.reactions.emojis.indexOf(emoji)]);
	const member = await message.guild.fetchMember(user);
	if (!member.roles.has(role.id)) return;

	await member.removeRole(settings.reactions.roles[settings.reactions.emojis.indexOf(emoji)]).catch(() => null);
  // might add perms check/feedback to config
	await messageReaction.message.channel.sendMessage(`I have successfully added ${role.name} to ${user.username} via reaction!`).then(msg => msg.delete(10000).catch(() => null)); // eslint-disable-line consistent-return

	messageReaction = null;
	user = null;
};
