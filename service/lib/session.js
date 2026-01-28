import { join } from 'node:path';
import { mkdir, readFile, writeFile, rm, access, constants } from "fs/promises";
import { randomUUID } from 'crypto';

const { default: dbHelper } = await import(join(__basedir, '/helper/sqlite.helper.js'));
const db = dbHelper.db;

class SESSION {
	constructor(){
		const self = this;
	}

	sessionPath = '';

	async init({ expiry }){
		const self = this;

		const rootPath = join(__basedir, '..');
		self.sessionPath = join(rootPath, 'tmp/session');
		await mkdir(self.sessionPath, { recursive: true });

  		db.prepare(`
    		CREATE TABLE IF NOT EXISTS sessions (
      	  	  id TEXT PRIMARY KEY,
      	  	  name TEXT,
      	  	  visibility INTEGER, -- 0 = public, 1 = private
      	  	  expiredTimestamp INTEGER
    		);
    	`).run();

		self.expiry = expiry;

		self.loopClearSession();
	}

	async check(request, reply){
		const self = this;

		let sessionId = request.cookies.session_id;

		if(sessionId){
			const sessionData = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

			if (sessionData) {
				if(sessionData.expiredTimestamp > Date.now()){
					request.sessionData = {
        				...sessionData
      				};
      			}
			}else{
				sessionId = await self.createSession(request, reply);
			}
		}else{
			sessionId = await self.createSession(request, reply);
		}

		await self.prepareSessionDir(sessionId);
	}

	async createSession(request, reply){
		const self = this;

		const newId = randomUUID();
		const expiry = Date.now() + self.expiry * 1000; 

		db.prepare(`
    		INSERT INTO sessions (id, name, visibility, expiredTimestamp)
    		VALUES (?, ?, ?, ?)
    	`).run(newId, '', 1, expiry);

    	reply.setCookie('session_id', newId, { path: '/', httpOnly: true, maxAge: 60 * 60 * 24 * 365 });

    	return newId;
	}

	async prepareSessionDir(sessionId){
		const self = this;

		const sessionIdPath = join(self.sessionPath, sessionId);
		const isExist = await access(sessionIdPath, constants.F_OK)
			.then(() => true)
			.catch(() => false);

		if(isExist){
			return;
		}

		// create folder inside sessionPath
		await mkdir(sessionIdPath, { recursive: true });
	}

	async loopClearSession(){
		const self = this;

		while(true){

			const currentTime = Date.now();

			const result2 = db.prepare('SELECT id, expiredTimestamp FROM sessions').all();
			
			const result = db.prepare('SELECT id FROM sessions WHERE expiredTimestamp < ?').all(currentTime);
			db.prepare('DELETE FROM sessions WHERE expiredTimestamp < ?').run(currentTime);

			for(const item of result2){
				console.log(currentTime - item.expiredTimestamp)
			}

			if(result.length){
				for(const item of result){
					await rm(
						join(self.sessionPath, item.id),
						{ recursive: true, force: true }
					);
				}
			}

			await new Promise(r => setTimeout(r, 1000));
		}
	}

}

export default new SESSION();
