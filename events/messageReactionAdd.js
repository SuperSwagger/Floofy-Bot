const guildSettings = require('../dataProviders/postgreSQL/models/GuildSettings');
const starBoard = require('../dataProviders/postgreSQL/models/StarBoard');

const winston = require('../structures/Logger.js');
const path = require('path');
const { URL } = require('url');

exports.run = async (bot, messageReaction, user) => {
	const message = messageReaction.message;
	const starboard = message.guild.channels.find('name', 'starboard');
	if (messageReaction.emoji.name === '⭐' && starboard) {
		// bot.funcs.logEvent(bot, 'messageReactionAdd');
		if (message.author.id === user.id) {
			messageReaction.remove(user.id);
			return message.channel.send(`${user}, you cannot star your own messages!`); // eslint-disable-line consistent-return
		}

		const settings = await starBoard.findOne({ where: { guildID: message.guild.id } }) || await starBoard.create({ guildID: message.guild.id });
		const starred = settings.starred;

		if (starred.hasOwnProperty(message.id)) {
			if (starred[message.id].stars.includes(user.id)) return message.channel.send(`${user}, you cannot star the same message twice!`); // eslint-disable-line consistent-return
			const starCount = starred[message.id].count += 1;
			const starredMessage = await starboard.fetchMessage(starred[message.id].starredMessageID).catch(() => null);
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
			starred[message.id].stars.push(user.id);
			settings.starred = starred;

			await settings.save();
		}
		else {
			const starCount = 1;
			let attachmentImage;
			const extensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);
			const linkRegex = /https?:\/\/(?:\w+\.)?[\w-]+\.[\w]{2,3}(?:\/[\w-_\.]+)+\.(?:png|jpg|jpeg|gif|webp)/; // eslint-disable-line no-useless-escape

			if (message.attachments.some(attachment => {
				try {
					const url = new URL(attachment.url);
					const ext = path.extname(url.pathname);
					return extensions.has(ext);
				}
				catch (err) {
					if (err.message !== 'Invalid URL') winston.error(err);
					return false;
				}
			})) attachmentImage = message.attachments.first().url;

			if (!attachmentImage) {
				const linkMatch = message.content.match(linkRegex);
				if (linkMatch) {
					try {
						const url = new URL(linkMatch[0]);
						const ext = path.extname(url.pathname);
						if (extensions.has(ext)) attachmentImage = linkMatch[0]; // eslint-disable-line max-depth
					}
					catch (err) {
						if (err.message === 'Invalid URL') winston.info('No valid image link.'); // eslint-disable-line max-depth
						else winston.error(err);
					}
				}
			}

			const sentStar = await starboard.send({
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
							value: message.content ? message.cleanContent.substring(0, 1000) : '\u200B'
						}
					],
					image: { url: attachmentImage ? attachmentImage.toString() : undefined },
					timestamp: message.createdAt,
					footer: { text: `${starCount} ⭐` }
				}
			}).catch(err => null); // eslint-disable-line

			starred[message.id] = {};
			starred[message.id].authorID = message.author.id;
			starred[message.id].starredMessageID = sentStar.id;
			starred[message.id].starredMessageContent = message.cleanContent;
			starred[message.id].starredMessageImage = attachmentImage || '';
			starred[message.id].starredMessageDate = message.createdAt;
			starred[message.id].count = starCount;
			starred[message.id].stars = [];
			starred[message.id].stars.push(user.id);
			settings.starred = starred;

			await settings.save();
		}
	}

	const settings = await guildSettings.findOne({ where: { guildID: message.guild.id } });

	if (!message.guild || !message.guild.member(user)) return; // eslint-disable-line consistent-return
	if (!settings || !settings.reactions || !settings.reactions.enabled || message.channel.id !== settings.reactions.channel) return; // eslint-disable-line consistent-return

	const channel = bot.channels.get(settings.reactions.channel);
	const msgs = await channel.fetchPinnedMessages().catch(() => null) || channel.messages;
	const pinned = msgs.first() ? msgs.first().id : null;
	const emoji = messageReaction.emoji.hasOwnProperty('guild') ? messageReaction.emoji.id : messageReaction.emoji.name;

	if (message.id !== bot.channels.get(settings.reactions.channel).messages.first().id && messageReaction.message.id !== pinned) return; // eslint-disable-line consistent-return
	if (!settings.reactions.roles[settings.reactions.emojis.indexOf(emoji)]) return messageReaction.message.channel.sendMessage('There is no role assigned to this reaction!');

	const role = message.guild.roles.get(settings.reactions.roles[settings.reactions.emojis.indexOf(emoji)]);
	const member = await message.guild.fetchMember(user);
	if (member.roles.has(role.id)) return message.channel.send('You already have that role.').then(msg => msg.delete(5000));

	await member.addRole(settings.reactions.roles[settings.reactions.emojis.indexOf(emoji)]).catch(() => null);
  // might add perms check/feedback to config
	await messageReaction.message.channel.sendMessage(`I have successfully added ${role.name} to ${user.username} via reaction!`).then(msg => msg.delete(10000).catch(() => null));

	messageReaction = null;
	user = null;
};
