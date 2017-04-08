const permFlags = require('discord.js/src/util/Permissions.js').FLAGS;
const { client } = require('../bot.js');

module.exports = (requiredPerms) => {
	client.log.logFunc('botPermissions');
	const genObject = {};

	for (const key in permFlags) {
		genObject[key] = false;
	}

	genObject.READ_MESSAGES = true;
	genObject.SEND_MESSAGES = true;

	requiredPerms.forEach(val => {
		if (genObject.hasOwnProperty(val)) genObject[val] = true;
	});

	let permNumber = 0;
	for (const key in genObject) {
		if (genObject[key] === true) {
			permNumber += permFlags[key];
		}
	}
	return permNumber;
};
