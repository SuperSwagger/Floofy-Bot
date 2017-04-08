global.Promise = require('bluebird');

const commando = require('discord.js-commando');
const Discord = require('discord.js');

const guildSettings = require('./dataProviders/postgreSQL/models/GuildSettings');
const Currency = require('./structures/currency/Currency');
const Moderation = require('./structures/Moderation');

const { oneLine } = require('common-tags');
const path = require('path');
// const Raven = require('raven');
const Log = require('./structures/Logger');

// const memwatch = require('memwatch-next');
// const heapdump = require('heapdump');

const Database = require('./dataProviders/postgreSQL/PostgreSQL');
const Redis = require('./dataProviders/redis/Redis');
const SequelizeProvider = require('./dataProviders/postgreSQL/SequelizeProvider');
const { owner, token, smashladder } = require('./settings');

const loadEventsNew = require('./functions/loadEventsNew.js');
const loadFunctionsNew = require('./functions/loadFunctionsNew.js');

const SmashLadder = require('../smashladder/index.js');

const database = new Database();
const redis = new Redis();
const client = new commando.Client({
	owner: owner,
	commandPrefix: '.',
	unknownCommandResponse: false,
	disableEveryone: true,
	clientOptions: { disabledEvents: ['USER_NOTE_UPDATE', 'VOICE_STATE_UPDATE', 'TYPING_START', 'VOICE_SERVER_UPDATE', 'PRESENCE_UPDATE'] },
	messageCacheMaxSize: 10,
	messageCacheLifetime: 1000
});

client.coreBaseDir = `${__dirname}/`;
client.clientBaseDir = `${process.cwd()}/`;

// Raven.config(config.ravenKey).install();

database.start();
redis.start();

client.setProvider(new SequelizeProvider(database.db));

client.dispatcher.addInhibitor(msg => {
	if (msg.channel.topic && msg.channel.topic.includes('[block]')) return 'Command blocked because the topic contains [block].';
	return false;
});

client.dispatcher.addInhibitor(msg => {
	const blacklist = client.provider.get('global', 'userBlacklist', []);
	if (!blacklist.includes(msg.author.id)) return false;
	return `User ${msg.author.username}#${msg.author.discriminator} (${msg.author.id}) has been blacklisted.`;
});

client
	.on('error', console.error)
	.on('warn', console.warn)
	.on('disconnect', (err) => {
		client.log.hook({ title: 'Disconnected', color: client.log.colours.warn });
		client.log.error(err);
		if (err.code === 1000) process.exit();
	})
	.on('reconnect', () => { client.log.warn('Reconnecting...'); })
	.once('ready', async () => {
		client.log = new Log(client);
		client.log.hook({ title: 'Logged in', color: client.log.colours.info });

		client.log.info(oneLine`
			Client ready... Logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})
		`);
		Currency.leaderboard();

		loadFunctionsNew(client).then(() => {
			loadEventsNew(client);
			client.methods = {};
			client.methods.Collection = Discord.Collection;
			client.methods.Embed = Discord.RichEmbed;
		});

		Moderation.initializeCases().then(() => client.log.info('Successfully initialized cases')).catch(err => client.log.error(err));

		client.sl = new SmashLadder();

		client.sl.on('ready', () => {
			client.log.info('Connected to Smashladder successfully!');
		});

		client.sl.login(smashladder.user, smashladder.pass);

		let settings, channel;
		for (const [, guild] of client.guilds) {
			settings = await guildSettings.findOne({ where: { guildID: guild.id } });
			// this should be in redis perhaps
			if (!settings || !settings.reactions) continue;
			channel = client.channels.get(settings.reactions.channel);
			if (!channel) continue;
			channel.fetchMessages(10);
			channel.fetchPinnedMessages();
		}

		/*
		function checkStats() {
			require('usage').lookup(process.pid, (err, result) => {
				if (err) client.log.error(err);
				if (client.voiceConnections.size === 0 && result.cpu > 70) {
					client.log.hook({ title: `Detected high CPU usage: ${result.cpu.toFixed(2)}`, color: client.log.colours.error });
					client.log.error(err);
					process.exit();
				}
				if ((process.memoryUsage().heapUsed / 1024 / 1024) > 1500) {
					client.log.hook({ title: `Detected high Memory usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}`, color: client.log.colours.error });
					client.log.error(err);
					process.exit();
				}
			});
		}
		client.setInterval(checkStats(), 60000);
		*/

		/*
		// memory leag debug
		memwatch.on('leak', (info) => {
			console.error(info);
			const file = `./floofybot-${process.pid}-${Date.now()}.heapsnapshot`;
			heapdump.writeSnapshot(file, (err) => {
				if (err) console.error(err);
				else console.error(`Wrote snapshot: ${file}`);
			});
		});
		*/

		let servers = ` in ${client.guilds.size} servers!`;
		let users = ` with ${client.guilds.reduce((a, b) => a + b.memberCount, 0)} users!`;
		let games = [`type ${client.commandPrefix}help for commands!`, servers, `type ${client.commandPrefix}join to invite me!`, users];
		client.user.setGame(servers);
		setInterval(() => {
			servers = `in ${client.guilds.size} servers!`;
			client.user.setGame(games[Math.floor(Math.random() * games.length)]);
		}, Math.floor(Math.random() * (600000 - 120000 + 1)) + 120000);
	})
	.on('commandRun', (cmd, promise, msg, args) => {
		/*
		client.channels.get('289168537254232064').send(stripIndents`
			Time: \`${moment(Date.now()).format('dddd, MMMM Do YYYY, h:mm:ss a')}\`
			Command: \`${cmd.memberName}\`
			Current Memory: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\`
			Current Swap: \`${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB\`
			`);
			*/

		client.log.info(oneLine`${msg.author.username}#${msg.author.discriminator} (${msg.author.id})
			> ${msg.guild ? `${msg.guild.name} (${msg.guild.id})` : 'DM'}
			>> ${cmd.groupID}:${cmd.memberName}
			${Object.values(args)[0] !== '' ? ` >>> ${Object.values(args)}` : ''}
		`);
	})
	.on('commandError', (cmd, err) => {
		if (err instanceof commando.FriendlyError) return;
		console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
	})
	.on('commandBlocked', (msg, reason) => {
		client.log.info(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
	})
	.on('commandPrefixChange', (guild, prefix) => {
		client.log.info(oneLine`
			Prefix changed to ${prefix || 'the default'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('commandStatusChange', (guild, command, enabled) => {
		client.log.info(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('groupStatusChange', (guild, group, enabled) => {
		client.log.info(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	});

client.registry
	.registerGroups([
		['commands', 'Commands'],
		['info', 'Information'],
		['util', 'Utility'],
		['mod', 'Moderation'],
		['config', 'Configuration'],
		['currency', 'Currency'],
		['system', 'System'],
		['games', 'Games'],
		['item', 'Item'],
		['economy', 'Economy'],
		['social', 'Social'],
		['music', 'Music'],
		['tags', 'Tags'],
		['fun', 'Fun'],
		['misc', 'Miscellaneous'],
		['nsfw', 'NSFW'],
		['test', 'Testing']
	])
	.registerDefaultTypes()
	.registerTypesIn(path.join(__dirname, 'types'))
	.registerCommandsIn(path.join(__dirname, 'commands'))
	.registerDefaultCommands({ eval_: false });

client.login(token);

process.on('unhandledRejection', (err) => {
	if (!err) return;

	let errorString = 'Uncaught Promise Error:\n';
	if (err.status === 400) return console.error(errorString += err.text || err.body.message); // eslint-disable-line consistent-return
	if (!err.response) return console.error(errorString += err.stack); // eslint-disable-line consistent-return

	if (err.response.text && err.response.status) {
		errorString += `Status: ${err.response.status}: ${err.response.text}\n`;
	}
	if (err.response.request && err.response.request.method && err.response.request.url) {
		errorString += `Request: ${err.response.request.method}: ${err.response.request.url}\n`;
	}
	client.log.error(errorString += err.stack);
});

exports.client = client;
