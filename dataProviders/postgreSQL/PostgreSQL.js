const Sequelize = require('sequelize');
const logger = require('../../structures/Logger.js');

const db = require('../../settings').db;

class Database {
	constructor() {
		this.database = new Sequelize(db, { logging: false });
	}

	get db() {
		return this.database;
	}

	start() {
		this.database.authenticate()
			.then(() => console.log('Connection has been established successfully.'))
			.then(() => this.database.sync())
			.then(() => console.log('Syncing Database...'))
			.catch(err => console.error(`Unable to connect to the database: ${err}`));
	}
}

module.exports = Database;
