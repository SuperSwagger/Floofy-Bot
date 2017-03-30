const { Command } = require('discord.js-commando');
const moment = require('moment');
const { stripIndents } = require('common-tags');

module.exports = class ProfileCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'slp',
			group: 'info',
			memberName: 'slp',
			description: 'Get info on a user.',
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'user',
					prompt: 'what user would you like to have information on?\n',
					type: 'string',
					parse: (str) => {
						return str.toLowerCase();
					}
				}
			]
		});
	}

	async run(message, args) { // eslint-disable-line
		if (!this.client.sl) return message.reply('an error occurred, please try again.');
		const search = await this.client.sl.findUser(args.user).catch(() => null);
		if (!search) {
			return message.reply('I could not locate that user.');
		} else if (search.length > 0) {
			if (search[0].username.toLowerCase() === args.user) search.username = search[0].username;
			else return message.reply(`I got a few results, please narrow down your search.\n${search.map(user => user.username).join(', ')}`);
		}
		const player = await this.client.sl.fetchUser(search.username).then(res => res.body.user);
		const info = await this.client.sl.sortRanked(player);

		const embed = new this.client.methods.Embed()
		.setTimestamp()
		.setFooter('Floofy', this.client.user.avatarURL);

		if (player.selected_flair) {
			if (player.is_admin) {
				embed.setColor('FFFF00');
			} else if (!player.glow_color) {
				if (player.is_mod) embed.setColor('F52828');
				else embed.setColor('4444FF');
			} else { embed.setColor(player.glow_color); }
			embed.setAuthor(`${player.username}'s Smashladder Profile${player.display_name ? ` (${player.display_name})` : ''}`, `http:${player.selected_flair.url}`, player.profile_url);
		} else { embed.setAuthor(`${player.username}'s Smashladder Profile`, undefined, player.profile_url); }
		if (player.is_mod) embed.addField('\uD83D\uDDDD SITE ADMIN', 'If you have any issues with any users or matches, talk to this person!');
		if (info.thumbnail) embed.setThumbnail(info.thumbnail);

		// make emoji server and map characters/game to display next to embed text
		embed
			.addField('❯ **User Information**', stripIndents`
		❯ **Account Creation**: ${moment.unix(player.member_since.timestamp).format('DD/MM/YYYY, h:mm:ss a zz')}
		❯ **Status**: ${player.is_online ? `Online${player.is_playing ? '\nIn a match' : '\nNot in a match'}` : 'Offline'}
		${player.location && player.location.country ? `❯ **Location**: ${player.location.country.name}` : null}
		`)
			.addField('❯ **Ranked Statistics**', stripIndents`
		❯ **Characters**: ${info.playedCharacters ? info.playedCharacters : 'N/A'}
		❯ **Played Games**: ${info.playedGames ? info.playedGames : 'N/A'}
		❯ **Most Played Character**: ${info.mostPlayedCharacter.name ? info.mostPlayedCharacter.name : 'N/A'}
		❯ **Most Played Game**: ${info.mostPlayedGame.name}
		❯ **Ranking Info**: ${info.tiers ? `Tier: ${info.tiers}${info.standings ? `\nStanding: ${info.standings}` : '\nNo Standing!'}` : 'Not Ranked!'}
		`);

		return message.channel.sendEmbed(embed).catch(() => message.channel.sendMessage('Failed to sort profile information! Please contact the bot owner with the username search.'));
	}
};
