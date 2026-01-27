global.__basedir = import.meta.dirname;

import fs from "fs";
import { join } from 'node:path';

const { default: fastifyHelper } = await import(join(__basedir, '/helper/fastify.helper.js'));

await fastifyHelper.init({
	staticConfig: {
		root: join(__basedir, '../dist'),
		prefix: '/'
	},
	routes: join(__basedir, 'routes'),
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
