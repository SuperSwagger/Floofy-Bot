const { stripIndents } = require('common-tags');
const moment = require('moment');
const Modlogs = require('../dataProviders/postgreSQL/models/Modlogs');
const { TextChannel, Guild, Collection, User, RichEmbed, MessageEmbed, MessageCollector } = require('discord.js'); // eslint-disable-line

module.exports = class Moderation {
	constructor(mod, user, guild, reason, type) {
		this.mod = mod;
		this.user = user;
		this.reason = reason;
		this.type = type;
		this.guild = guild;
		this.guildID = this.guild.id;
		this.caseCount = null;
		this.caseMessageID = null;
		this.globalCaseCount = 0;
	}

	static async initializeCases() {
		Modlogs.warnings = await this.getAllWarnings();
		Modlogs.mutes = await this.getAllMutes();
		Modlogs.kicks = await this.getAllKicks();
		Modlogs.softbans = await this.getAllSoftbans();
		Modlogs.bans = await this.getAllBans();
		Modlogs.cases.push(...Modlogs.warnings);
		Modlogs.cases.push(...Modlogs.mutes);
		Modlogs.cases.push(...Modlogs.kicks);
		Modlogs.cases.push(...Modlogs.softbans);
		Modlogs.cases.push(...Modlogs.bans);
	}

	async postCase() {
		const channel = this.guild.channels.find('name', 'modlogs');
		if (!channel) return null;

		await this.newCase();
		const embed = new RichEmbed()
		.setColor(this.getColor())
		.setAuthor(this.getMod(), this.mod.avatarURL)
		.setDescription(this.formatDescription())
		.setFooter(this.formatFooter());

		const caseMessage = await channel.sendEmbed(embed);
		return this.updateCaseMessageID(caseMessage.id);
	}

	async newCase() {
		await this.getGlobalCaseCount(this.guildID);
		await Modlogs.sync();
		const newCase = await Modlogs.create({
			guildID: this.guildID,
			userID: this.user.id,
			globalCaseCount: this.globalCaseCount + 1,
			type: this.type,
			reason: this.reason,
			caseCount: this.caseCount,
			mod: this.mod.id
		});
		Modlogs[`${this.type}s`].push(newCase);
		Modlogs.cases.push(newCase);
	}

	static async getCases(options) {
		return await Modlogs.findAll(options);
	}

	static getCase(gID, index) {
		return Modlogs.cases.find(thing => thing.globalCaseCount === index && thing.guildID === gID);
	}

	static getLastCase(gID) {
		const guildCases = Modlogs.cases.filter(thing => thing.guildID === gID);
		return Modlogs.cases ? guildCases[guildCases.length - 1] : null;
	}

	static lastCaseIs(gID, uID) {
		return this.getLastCase(gID).userID === uID;
	}

	async updateCaseMessageID(id, index) {
		if (!index) index = await this.getGlobalCaseCount(this.guildID);
		const dbCase = await Modlogs.findOne({ where: { guildID: this.guildID, globalCaseCount: index } });
		dbCase.caseMessageID = id;
		await dbCase.save();
		const cachedCase = Moderation.getCase(this.guildID, index);
		cachedCase.caseMessageID = id;
		Modlogs.cases[Modlogs.cases.indexOf(cachedCase)] = cachedCase;
	}

	static async updateCaseReason(index, gID, newReason) {
		const dbCase = await Modlogs.findOne({ where: { guildID: gID, globalCaseCount: index } });
		dbCase.reason = newReason;
		await dbCase.save();
		const cachedCase = this.getCase(gID, index);
		cachedCase.reason = newReason;
		Modlogs.cases[Modlogs.cases.indexOf(cachedCase)] = cachedCase;
	}

	static async getAllWarnings() {
		Modlogs.warnings = await this.getCases({ where: { type: 'warning' } });
		return Modlogs.warnings;
	}

	static getWarningsFor(guild, user) {
		return Modlogs.warnings.filter(aCase => aCase.userID === user && aCase.guildID === guild);
	}

	static async getAllMutes() {
		Modlogs.mutes = await this.getCases({ where: { type: 'mute' } });
		return Modlogs.mutes;
	}

	static getMutesFor(guild, user) {
		return Modlogs.mutes.filter(aCase => aCase.userID === user && aCase.guildID === guild);
	}

	static async getAllKicks() {
		Modlogs.kicks = await this.getCases({ where: { type: 'kick' } });
		return Modlogs.kicks;
	}

	static getKicksFor(guild, user) {
		return Modlogs.kicks.filter(aCase => aCase.userID === user && aCase.guildID === guild);
	}

	static async getAllSoftbans() {
		Modlogs.softbans = await this.getCases({ where: { type: 'softban' } });
		return Modlogs.softbans;
	}

	static getSoftbansFor(guild, user) {
		return Modlogs.softbans.filter(aCase => aCase.userID === user && aCase.guildID === guild);
	}

	static async getAllBans() {
		Modlogs.bans = await this.getCases({ where: { type: 'ban' } });
		return Modlogs.bans;
	}

	static getBansFor(guild, user) {
		return Modlogs.bans.filter(aCase => aCase.userID === user && aCase.guildID === guild);
	}

	get currentCaseCount() {
		switch (this.type) {
			case 'warning':
				this.caseCount = Modlogs.warnings.length;
				return this.caseCount;
			case 'mute':
				this.caseCount = Modlogs.mutes.length;
				return this.caseCount;
			case 'kick':
				this.caseCount = Modlogs.kicks.length;
				return this.caseCount;
			case 'softban':
				this.caseCount = Modlogs.softbans.length;
				return this.caseCount;
			case 'ban':
				this.caseCount = Modlogs.bans.length;
				return this.caseCount;
			default:
				return null;
		}
	}

	async getGlobalCaseCount(gid) {
		const cases = await Moderation.getCases({ where: { guildID: gid } });
		this.globalCaseCount = cases.length;
		return cases.length;
	}

	getUser() {
		return {
			user: `${this.user.username}#${this.user.discriminator} (${this.user.id})`,
			avatar: this.user.avatarURL
		};
	}

	getMod() {
		if (this.mod) return `${this.mod.username}#${this.mod.discriminator}`;
		else return `Use reason \`${this.globalCaseCount}\` <new reason>`;
	}

	formatDescription() {
		return stripIndents`
			**User**: ${this.getUser().user}
			**Action**: ${this.type}
			**Reason**: ${this.reason ? this.reason : `Use reason \`${this.globalCaseCount}\` <new reason>`}`;
	}

	getColor() {
		switch (this.type) {
			case 'warning':
				return '#ff865e';
			case 'mute':
				return '#ffb95e';
			case 'kick':
				return '#fcaa3f';
			case 'softban':
				return '#ff5e59';
			case 'ban':
				return '#f7514c';
			default:
				return '#ff9793';
		}
	}

	formatFooter() {
		return `Case ${this.globalCaseCount} | ${moment(new Date()).format('ddd MMM DD, YYYY @ hh:mma')}`;
	}

	static getInfractions(guild, user) {
		const warnings = this.getWarningsFor(guild, user);
		const mutes = this.getMutesFor(guild, user);
		const kicks = this.getKicksFor(guild, user);
		const softbans = this.getSoftbansFor(guild, user);
		const bans = this.getBansFor(guild, user);
		return `This user has ${warnings.length} warnings, ${mutes.length} mutes, ${kicks.length} kicks, ${softbans.length} softbans, ${bans.length} bans`;
	}
};
