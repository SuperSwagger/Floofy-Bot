const { client } = require('../bot.js');

module.exports = (str) => {
	client.log.logFunc('toTitleCase');
	return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};
