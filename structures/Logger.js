const moment = require('moment');
const { stripIndents, oneLine } = require('common-tags');
const request = require('request-promise');
const { RichEmbed } = require('discord.js');
const { webhook } = require('../settings');
const winston = require('winston');

winston.setLevels({
	debug: 0,
	info: 1,
	silly: 2,
	warn: 3,
	error: 4
});
winston.addColors({
	debug: 'green',
	info: 'cyan',
	silly: 'magenta',
	warn: 'yellow',
	error: 'red'
});


function formatter(options) {
	return oneLine`
	[${winston.config.colorize(options.level, `${moment().format('HH:mm:ss')}`)}]
	[${winston.config.colorize(options.level, options.level)}] ${options.message}`;
}

module.exports = class extends winston.Logger {
	constructor(client) {
		super({
			transports: [
				new winston.transports.Console({
					colorize: true,
					level: 'silly',
					showLevel: true,
					formatter: formatter
				}),
				new winston.transports.File({ filename: 'funcs.log' })
			],
			level: 'verbose'
		});

		this.colours = {
			info: '3247335',
			warn: '16567385',
			error: '13369344'
		};

		this.client = client;

		this.webhook = request.defaults({
			uri: webhook,
			json: true,
			method: 'post'
		});
	}

	hook(data = {}) {
		const embed = new RichEmbed(data)
            .setFooter(`Time: ${moment().format('HH:mm:ss')}`);
		return this.webhook({ body: { embeds: [embed] } });
	}

	logFunc(func, data = {}) {
		const embed = new RichEmbed(data)
		.setTitle(func)
		.setDescription(stripIndents`
			Event: \`${func}\`
			Current Memory: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`
			Current Swap: \`${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB\`
			`)
		.setFooter(`Time: ${moment(Date.now()).format('dddd, MMMM Do YYYY, h:mm:ss a')}`);
		return this.webhook({ body: { embeds: [embed] } });
	}
};
