import sqlite3 from 'better-sqlite3';

class DATABASE {
	init(options){

		const self = this;

		const { dbPath } = options;

		self.db = new sqlite3(dbPath);

		return self.db;
	}
}

export default new DATABASE();
