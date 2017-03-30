const { Command } = require('discord.js-commando');
const Case = require('../../structures/Moderation');

module.exports = class WarnCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'warn',
			group: 'mod',
			memberName: 'warn',
			description: 'Warns a user.',
			guildOnly: true,

			args: [
				{
					key: 'member',
					prompt: 'What user would you like to warn?\n',
					type: 'member'
				},
				{
					key: 'reason',
					prompt: 'What are you warning this user for?\n',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		// return msg.client.funcs.isStaff(msg.member);
		return this.client.options.owner === msg.author.id;
	}

	async run(msg, args) {
		const { member } = args;
		if (msg.author.id === member.user.id) return msg.channel.send('If you try to warn yourself, you\'re gonna have a *baaad* time.');
		if (msg.client.funcs.isStaff(member)) return msg.channel.send('You cannot warn a fellow staff member!');
		const channel = msg.guild.channels.find('name', 'modlogs');
		if (!channel) return msg.reply('There is no channel for modlogs set. Please create one called `modlogs` to get started!');
		const mod = new Case(msg.author, member.user, msg.guild, args.reason, 'warning');
		let message = await msg.channel.send('Warning user...');
		await mod.postCase();
		await member.send(`You've received a warning in ${msg.guild.name}.\n\`Reason: ${args.reason}`);
		return message.edit(`Successfully warned ${member.user.username}.`);
	}
};
