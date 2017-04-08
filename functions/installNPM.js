const exec = require('child_process').exec;
const { client } = require('../bot.js');

module.exports = module => new Promise((resolve, reject) => {
	client.log.logFunc('installNPM');
	exec(`npm i ${module}`, (e, stdout, stderr) => {
		if (e) {
			console.log('=====NEW DEPENDANCY INSTALL FAILED HORRIBLY=====');
			reject(e);
		} else {
			console.log('=====INSTALLED NEW DEPENDANCY=====');
			console.log(stdout);
			console.error(stderr);
			resolve();
		}
	});
});
