const { Command } = require('discord.js-commando');
const fs = require('fs');
const path = require('path');

module.exports = class EvalCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reloade',
			group: 'util',
			memberName: 'reloade',
			description: 'Reloads an event.',
			details: 'Only the bot owner(s) may use this command.',

			args: [
				{
					key: 'event',
					prompt: 'What event to reload?\n',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.options.owner === msg.author.id;
	}

	async run(msg, args) {
		const type = 'events';
		const event = args.event;
		const dir = path.resolve(`${this.client.coreBaseDir}${type}`);
		const exists = fs.existsSync(dir);
		if (!exists) msg.reply('I could not load the directory.');
		fs.readdirSync(dir, (err, files) => {
			if (err) console.error(err);
			files.forEach(file => {
				this.client.removeListener(file, listener);
				delete require.cache[require.resolve(`${file.path}${path.sep}${file.base}`)];
				this.client.on(file, (...args) => require(`${file.path}${path.sep}${file.base}`).run(this.client, ...args));
			});
		});
	}

};
