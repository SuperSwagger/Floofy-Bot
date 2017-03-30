const { Command } = require('discord.js-commando');
const guildSettings = require('../../dataProviders/postgreSQL/models/GuildSettings');

module.exports = class AddFlairCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'addflair',
			group: 'config',
			memberName: 'addflair',
			description: 'Adds a role to the list of self-assignable roles.',
			guildOnly: true,
			examples: [
				'addflair frens'
			],
			args: [
				{
					key: 'roles',
					prompt: 'What role(s) would you like to add to the list of self-assignable roles?\n',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_GUILD');
	}

	async run(msg, args) {
		const settings = await guildSettings.findOne({ where: { guildID: msg.guild.id } }) || await guildSettings.create({ guildID: msg.guild.id });
		let flairs = settings.flairs;
		if (!flairs.roles) flairs.roles = [];
		let out = '', role;
		args = args.roles.split(',');
		for (let i = 0; i < args.length; i++) {
			args[i] = args[i].trim();
			role = msg.guild.roles.find(thing => thing.name.toLowerCase() === args[i].toLowerCase());
			if (!role) {
				out += `\`${args[i]}\` does not exist.\n`;
			}	else if (flairs.roles.includes(role.id)) { out += `\`${role.name}\` is already assigned.\n`; }			else {
				flairs.roles.push(role.id);
				out += `\`${role.name}\` added successfully!\n`;
			}
		}
		settings.flairs = flairs;
		settings.save().then(() => {
			return msg.channel.send(out);
		});
	}
};
