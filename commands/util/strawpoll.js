const { Command } = require('discord.js-commando');
const request = require('request-promise');
const stripIndents = require('common-tags').stripIndents;

const version = require('../../package').version;

module.exports = class StrawpollCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'strawpoll',
			group: 'util',
			memberName: 'strawpoll',
			description: 'Create a strawpoll.',
			details: stripIndents`Create a strawpoll.
				The first argument is always the title, if you provde it, otherwise your username will be used!
				If you need to use spaces in your title make sure you put them in SingleQuotes => \`'topic here'\``,
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			},

			args: [
				{
					key: 'title',
					prompt: 'what title would you like the strawpoll to have?\n',
					type: 'string',
					validate: title => {
						if (title.length > 200) {
							return `
								your title was ${title.length} characters long.
								Please limit your title to 200 characters.
							`;
						}
						return true;
					}
				},
				{
					key: 'option',
					prompt: 'what options would you like the strawpoll to have?\n',
					type: 'string',
					validate: option => {
						if (option.length > 160) {
							return `
								your option was ${option.length} characters long.
								Please limit your option to 160 characters.
							`;
						}
						return true;
					},
					infinite: true
				}
			]
		});
	}

	async run(msg, args) {
		const title = args.title;
		const options = args.option;

		if (options.length < 2) return msg.reply('please provide 2 or more options.');
		if (options.length > 31) return msg.reply('please provide less than 31 options.');

		const response = await request({
			method: 'POST',
			uri: `https://strawpoll.me/api/v2/polls`,
			followAllRedirects: true,
			headers: { 'User-Agent': `FloofyBot v${version} (https://github.com/Lewdcario/Floofy-Bot)` },
			body: {
				title: title,
				options: options,
				captcha: true
			},
			json: true
		});

		return msg.say(stripIndents`🗳 ${response.title}
			<http://strawpoll.me/${response.id}>
		`);
	}
};
