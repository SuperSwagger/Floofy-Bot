const winston = require('winston');
const moment = require('moment');
const { oneLine } = require('common-tags');

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


module.exports = new winston.Logger({
	transports: [
		new winston.transports.Console({
			colorize: true,
			level: 'silly',
			showLevel: true,
			formatter: formatter
		})
	]
});
