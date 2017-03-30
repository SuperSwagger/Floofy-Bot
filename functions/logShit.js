const { spawn } = require('child_process');
const { logChannel } = require('../settings');
let pm2 = false;

module.exports = (bot) => {
	if (pm2) return console.log('pm2 logs process already started...');
	const channel = bot.channels.get(logChannel);

	pm2 = spawn('pm2', ['logs']);
	pm2.on('exit', (code, signal) => {
		console.log('PM2 EXIT');
	});

	pm2.stderr.on('data', (data) => {
		channel.sendCode('shell', `ERROR- ${data}`, { split: true });
	});

	pm2.stdout.on('data', (data) => {
		channel.sendCode('shell', `Log - ${data}`, { split: true });
	});

	return pm2;
};
