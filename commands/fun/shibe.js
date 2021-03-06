const commando = require('discord.js-commando');
const superagent = require('superagent');

module.exports = class ShibeCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'shibe',
			aliases: ['shiba', 'shib'],
			group: 'fun',
			memberName: 'shibe',
			description: 'Outputs a random shibe.'
		});
	}

	async run(message) {
		let link = 'http://shibe.online/api/shibes?count=1&httpsurls=true';
		superagent.get(link).end((err, res) => {
			if (err) return message.channel.sendMessage('There was an error, please try again!');
			return message.channel.sendFile(res.body[0]);
		});
	}
};
