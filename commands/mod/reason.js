const { Command } = require('discord.js-commando');
const Case = require('../../structures/Moderation');

module.exports = class ReasonCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reason',
			group: 'mod',
			memberName: 'reason',
			description: 'Updates a case.',
			guildOnly: true,

			args: [
				{
					key: 'case',
					prompt: 'What case would you like to modify? Specify `latest` to modify the most recent case.\n',
					type: 'string',
					validate: (str) => {
						return str === 'latest' || parseInt(str);
					},
					parse: (str) => {
						return str === 'latest' ? 'latest' : parseInt(str);
					}
				},
				{
					key: 'reason',
					prompt: 'What should the new warning be?\n',
					type: 'string',
					validate: (str) => {
						if (str.length > 1024) return 'The specified reason is far too long, please try again with a maximum of 1024 characters.';
						return true;
					}
				}
			]
		});
	}

	hasPermission(msg) {
		// return msg.client.funcs.isStaff(msg.member);
		return this.client.options.owner === msg.author.id;
	}

	async run(msg, args) {
		const channel = msg.guild.channels.find('name', 'modlogs');
		if (!channel) return msg.reply('There is no channel for modlogs set. Please create one called `modlogs` to get started!');
		if (!channel.permissionsFor(this.client.user).hasPermission('MANAGE_MESSAGES')) return msg.reply('I do not have permissions to modify messages in the `modlogs` channel.');

		let message = await msg.channel.send('Updating case...');
		const caseToEdit = args.case === 'latest' ? Case.getLastCase(msg.guild.id) : Case.getCase(msg.guild.id, args.case);
		if (!caseToEdit) return message.edit('could not find a case with the specified index.');
		if (msg.author.id !== caseToEdit.mod || !msg.member.hasPermission('MANAGE_SERVER')) return message.edit('Only someone with `manage server` permissions or the original moderator can update this case.');

		const caseMessage = await channel.fetchMessage(caseToEdit.caseMessageID);
		const regex = /\*\*Reason\*\*: (.*)/;
		const newDesc = caseMessage.embeds[0].description.replace(caseMessage.embeds[0].description.match(regex)[1], args.reason);
		const footer = caseMessage.embeds[0].footer.text;
		const colour = caseMessage.embeds[0].color;

		const embed = new this.client.methods.Embed();
		embed.setAuthor(`${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`, msg.author.avatarURL);
		embed.setDescription(newDesc).setFooter(footer).setColor(colour);
		caseMessage.edit('', { embed });

		Case.updateCaseReason(caseToEdit.globalCaseCount, msg.guild.id, args.reason);

		return message.edit('Successfully updated.');
	}
};
