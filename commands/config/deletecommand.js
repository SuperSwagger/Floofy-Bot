const commando = require('discord.js-commando');

module.exports = class Distance extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'deletecommand',
			group: 'config',
			aliases: ['deletecmd', 'removecmd', 'removecommand'],
			memberName: 'deletecommand',
			description: 'Deletes a custom command from the server.',
			guildOnly: true,
			examples: [
				'deletecommand say'
			],
			args: [
				{
					key: 'name',
					prompt: 'Please enter the name of the custom command to delete.',
					type: 'string'
				}
			]
		});
	}
	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_GUILD');
	}
	async run(message, args) {
		let settings = this.client.provider.get(message.guild, 'customcommands', {});
		if (!args.name.includes(', ')) args.name = [args.name.slice(0, 0), ',', args.name.slice(0)].join('');
		settings.splice(settings.indexOf(args.name));
		this.client.provider.set(message.guild.id, 'customcommands', settings);
		return message.reply(`The command \`${args.name}\` has been successfully removed.`);
	}
};