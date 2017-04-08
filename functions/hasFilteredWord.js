const { client } = require('../bot.js');

module.exports = (filteredWords, str) => {
	client.log.logFunc('hasFilteredWord');
	return filteredWords ? filteredWords.some(word => str.toLowerCase().includes(word)) : false;
};
