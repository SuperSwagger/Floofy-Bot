const Sequelize = require('sequelize');

const Database = require('../PostgreSQL');

const database = new Database();

let Modlogs = database.db.define('modlogs', {
	guildID: Sequelize.STRING,
	userID: Sequelize.STRING,
	globalCaseCount: {
		type: Sequelize.INTEGER,
		unique: true
	},
	type: Sequelize.STRING,
	reason: Sequelize.STRING,
	caseCount: Sequelize.INTEGER,
	mod: Sequelize.STRING,
	caseMessageID: Sequelize.STRING
});

Modlogs.sync({ force: true });

Modlogs.cases = [];
Modlogs.warnings = [];
Modlogs.mutes = [];
Modlogs.kicks = [];
Modlogs.softbans = [];
Modlogs.bans = [];

module.exports = Modlogs;
