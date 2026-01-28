global.__basedir = import.meta.dirname;

import fs from "fs";
import { join } from 'node:path';

// ===================== DATABASE =============================
const { default: dbHelper } = await import(join(__basedir, '/helper/sqlite.helper.js'));

await dbHelper.init({
	dbPath: join(__basedir, 'config', 'data.db'),
})

// ==================== SESSION ===============================
const { default: sessionLib } = await import(join(__basedir, '/lib/session.js'));

const SESSION_EXPIRY = 60 * 60 * 24 * 7;	// in seconds

await sessionLib.init({
	expiry: SESSION_EXPIRY
});

// ===================== FASTIFY ===============================
const { default: fastifyHelper } = await import(join(__basedir, '/helper/fastify.helper.js'));

await fastifyHelper.init({
	staticConfig: {
		root: join(__basedir, '../dist'),
		prefix: '/'
	},
	routes: join(__basedir, 'routes'),
	useStatefulSession: true,

	preRouteMiddleware: async (fastify) => {

		fastify.addHook('preHandler', async (request, reply) => {
			await sessionLib.check(request, reply);
		});
	},

	postRouteMiddleware: (fastify) => {

		fastify.setNotFoundHandler((req, reply) => {
  			if (!req?.raw?.url?.startsWith("/api")) {
    			const indexPath = join(__basedir, "../dist/index.html");
    			reply.type("text/html").send(fs.readFileSync(indexPath));
  			} else {
    			reply.status(404).send({ error: "Not Found" });
  			}
		});
	}
})
