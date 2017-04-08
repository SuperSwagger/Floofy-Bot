const { client } = require('../bot.js');

module.exports = (str) => {
	client.log.logFunc('capitalize');
	return str.charAt(0).toUpperCase() + str.slice(1);
};
