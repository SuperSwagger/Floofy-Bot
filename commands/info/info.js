const { Command } = require('discord.js-commando');
const moment = require('moment');
const { stripIndents } = require('common-tags');

module.exports = class UserInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'info',
			aliases: ['user', 'user-info'],
			group: 'info',
			memberName: 'info',
			description: 'Get info on a user.',
			details: `Get detailed information on the specified user.`,
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'member',
					prompt: 'what user would you like to have information on?\n',
					type: 'member',
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		if (!msg.channel.permissionsFor(this.client.user).hasPermission('EMBED_LINKS')) return msg.reply('I need `EMBED_LINKS` permissions to run this command.');

		const statuses = {
			online: '212789758110334977',
			idle: '212789859071426561',
			dnd: '236744731088912384',
			offline: '212790005943369728'
		};

		const user = args.member.hasOwnProperty('id') ? args.member.user : msg.author;
		const member = args.member.hasOwnProperty('id') ? args.member : msg.member;

		const embed = new this.client.methods.Embed();
		embed.setAuthor(`${user.username}#${user.discriminator} (${user.id})`, user.avatarURL);
		embed.setThumbnail(user.displayAvatarURL);
		embed.setFooter(this.client.user.username, this.client.user.avatarURL);
		embed.setTimestamp(new Date());
		embed.addField('❯ **User Information**', stripIndents`
		❯ Account Creation: ${moment(user.createdAt).tz('America/Chicago').format('dddd, MMMM Do YYYY, h:mm:ss a zz')}
		❯ Status: ${this.client.emojis.get(statuses[user.presence.status])}
		❯ Game: ${user.presence.game ? user.presence.game.name : 'N/A'}
		`);
		embed.setColor(0x0d0d0d);
		// colour via user profile?
		embed.addField('❯ **Member Information**', stripIndents`
			❯ Joined Server At: ${moment(member.joinedAt).tz('America/Chicago').format('dddd, MMMM Do YYYY, h:mm:ss a zz')}
			❯ Nickname: ${member.nickname ? member.nickname : 'N/A'}
		`);
		if (member.roles.size > 1) {
			if (member.roles.size <= 10) {
				embed.addField('❯ Roles', member.roles.map(role => {
					if (role.name !== '@everyone') return role.name;
					return '';
				}).join(', ').substring(2), true);
			} else {
				embed.addField('❯ Roles', 'Too Many', true);
			}
		}
		return msg.embed(embed);
	}
};
