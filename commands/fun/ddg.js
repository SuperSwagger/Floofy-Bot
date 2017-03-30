const { Command } = require('discord.js-commando');
const request = require('request-promise-native');

module.exports = class DDGSearchCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ddg',
			group: 'fun',
			memberName: 'ddg',
			description: 'Search through the DuckDuckGo search engine',
			examples: ['ddg lucario'],
			throttling: {
				usages: 2,
				duration: 30
			},
			args: [
				{
					key: 'query',
					prompt: 'What would you like to search?\n',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
		const { query } = args;
		const link = `http://api.duckduckgo.com/?q=DuckDuckGo&format=json&q=${encodeURI(query)}&t=Floofy-Bot`;
		request.get(link)
			.then(JSON.parse)
			.then(res => {
				const embed = new this.client.methods.Embed()
				.setDescription(res.Abstract)
				.setAuthor(`Requested by ${msg.author.username}#${msg.author.discriminator}`, msg.author.displayAvatarURL)
				.setTitle(res.Heading)
				.setURL(res.AbstractURL)
				.setFooter('Results from DuckDuckGo', 'https://duckduckgo.com/assets/icons/meta/DDG-icon_256x256.png');
				return msg.channel.sendEmbed(embed);
			})
			.catch(() => msg.say('There was an error, please try again!'));
	}
};
