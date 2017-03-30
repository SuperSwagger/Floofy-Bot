const { eventChannel } = require('../settings');
const { stripIndents } = require('common-tags');
const moment = require('moment');

module.exports = (bot, event) => {
	return bot.channels.get(eventChannel).send(stripIndents`
		Time: \`${moment(Date.now()).format('dddd, MMMM Do YYYY, h:mm:ss a')}\`
		Event: \`${event}\`
		Current Memory: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`
		Current Swap: \`${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB\`
		`);
};
