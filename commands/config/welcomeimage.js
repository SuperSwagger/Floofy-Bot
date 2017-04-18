const { Command } = require('discord.js-commando');
const Canvas = require('canvas');
const path = require('path');
// const guildSettings = require('../../dataProviders/postgreSQL/models/GuildSettings');
const fs = require('fs');

module.exports = class WelcomeImage extends Command {
	constructor(client) {
		super(client, {
			name: 'welcomeimage',
			group: 'config',
			memberName: 'welcomeimage',
			description: 'Configure a welcome image'
		});
	}

	hasPermission(msg) {
		return this.client.options.owner === msg.author.id;
	}

	async run(msg) {
		/*
		const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
		if (settings && settings.welcomefont) {
			Canvas.registerFont(path.join(__dirname, '..', '..', 'assets', 'custom', 'fonts', `${settings.welcomefont}.otf`), { family: `${settings.welcomefont}` });
			// will want a check otf or ttf
		}
		else {
			Canvas.registerFont(path.join(__dirname, '..', '..', 'assets', 'osu', 'fonts', 'exo2bold.ttf'), { family: 'exo2bold' });
			Canvas.registerFont(path.join(__dirname, '..', '..', 'assets', 'osu', 'fonts', 'exo2medium.ttf'), { family: 'exo2medium' });
			Canvas.registerFont(path.join(__dirname, '..', '..', 'assets', 'osu', 'fonts', 'exo2regular.ttf'), { family: 'exo2regular' });
		}
		*/
		Canvas.registerFont(path.join(__dirname, '..', '..', 'assets', 'welcome', 'fonts', `GiddyupStd.otf`), { family: 'GiddyupStd' });
		Canvas.registerFont(path.join(__dirname, '..', '..', 'assets', 'osu', 'fonts', 'exo2medium.ttf'), { family: 'exo2medium' });

		const read = fs.readFileSync(path.join(__dirname, '..', '..', 'assets', 'welcome', '89069012058656768.png'));
		const info = this.getDimensions(new Buffer(read).toString('base64'));
		console.log(info);

		let sizex = 500, sizey = 500;
		const canvas = new Canvas(sizex, sizey);

		// if (settings && settings.bgimage) {
		const background = new Canvas.Image();
		const ctx = canvas.getContext('2d');
		background.src = path.join(__dirname, '..', '..', 'assets', 'welcome', '89069012058656768.png');
		sizex = background.width;
		sizey = background.height;
		ctx.globalAlpha = 1.0;
		ctx.drawImage(background, 0, 0, canvas.width, 300);
		// }

		ctx.fillStyle = '#000000';
		ctx.textAlign = 'start';
		ctx.font = '25px GiddyupStd font';
		// ctx.font = `25px ${settings.welcomefont ? settings.welcomefont : 'exo2medium'}font`;
		ctx.fillText(`Welcome ${msg.author.tag}`, 50, 120);

		return msg.channel.sendFile(canvas.toBuffer()).catch(() => null);
	}

	toInt32(bytes) {
		return (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
	}
	getDimensions(data) {
		// http://stackoverflow.com/questions/15327959/get-height-and-width-dimensions-from-base64-png
		return {
			width: this.toInt32(data.slice(16, 20)),
			height: this.toInt32(data.slice(20, 24))
		};
	}
	base64Decode(data) {
		let result = [];
		let current = 0;
		let i, c;

		for (i = 0, c; c = data.charAt(i); i++) {
			if (c === '=') {
				if (i !== data.length - 1 && (i !== data.length - 2 || data.charAt(i + 1) !== '=')) {
					throw new SyntaxError('Unexpected padding character.');
				}

				break;
			}
			const base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
			var index = base64Characters.indexOf(c);

			if (index === -1) {
				throw new SyntaxError('Invalid Base64 character.');
			}

			current = (current << 6) | index;

			if (i % 4 === 3) {
				result.push(current >> 16, (current & 0xff00) >> 8, current & 0xff);
				current = 0;
			}
		}

		if (i % 4 === 1) {
			throw new SyntaxError('Invalid length for a Base64 string.');
		}

		if (i % 4 === 2) {
			result.push(current >> 4);
		}
		else if (i % 4 === 3) {
			current <<= 6;
			result.push(current >> 16, (current & 0xff00) >> 8);
		}

		return result;
	}
};
