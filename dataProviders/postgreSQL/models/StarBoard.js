const Sequelize = require('sequelize');

const Database = require('../PostgreSQL');

const database = new Database();

let StarBoard = database.db.define('starBoard', {
	guildID: Sequelize.STRING,
	starred: {
		type: Sequelize.JSON(), // eslint-disable-line new-cap
		defaultValue: {}
	}
});

StarBoard.sync();

module.exports = StarBoard;
