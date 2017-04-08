const { client } = require('../bot.js');

module.exports = (message) => {
	client.log.logFunc('hasImage');
	if (message.attachments && message.attachments.size > 0) return message.attachments.some(attachment => attachment.url.match(/\.(png|jpg|jpeg|gif|webp)$/));
	return false;
};
