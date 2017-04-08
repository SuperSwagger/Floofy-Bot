const { Command } = require('discord.js-commando');
const request = require('request-promise');
const vm = require('vm');

module.exports = class IMDBSearchCommandd extends Command {
	constructor(client) {
		super(client, {
			name: 'imdb',
			group: 'fun',
			memberName: 'imdb',
			description: 'Search for movies via the IMDB database',
			examples: ['imdb lucario'],
			throttling: {
				usages: 2,
				duration: 60
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

	hasPermission(msg) {
		return msg.author.id === this.client.options.owner;
	}

	async run(msg, args) {
		const { query } = args;
		let link = `http://sg.media-imdb.com/suggests/${query.charAt(0).toLowerCase()}/${query.toLowerCase().replace(' ', '_')}.json`;
		const movie = await request.get(link).catch(() => null);
		const name = `imdb$${query.toLowerCase().replace(' ', '_')}`;
		const jsonpSandbox = vm.createContext({ [name]: function parse(obj) { return obj; } });
		const info = vm.runInContext(movie, jsonpSandbox);
		console.log(info);
		const embed = new this.client.methods.Embed()
		.setAuthor(`Requested by: ${msg.author.username}:`, msg.author.displayAvatarURL)
		.setTitle(`Title: ${info.d[0].l}`)
		.setImage(info.d[1].i[0])
		.setFooter(`http://www.imdb.com/title/${info.d[0].id}`);
		return msg.channel.sendEmbed(embed);
	}
};
