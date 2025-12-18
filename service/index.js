global.__basedir = import.meta.dirname;

import { join } from 'node:path';
import Fastify from 'fastify';
import fastifyStatic from "@fastify/static";
import fs from "fs";

const { default: buildLib } = await import(join(__basedir, '/lib/build.js'))

const fastify = Fastify({
  	logger: true
})

fastify.register(fastifyStatic, {
	root: join(__basedir, "../dist"),
  	prefix: "/",
});

fastify.post('/api/build', async (request, reply) => {
	const { filename, buffer } = await buildLib.init(JSON.parse(request.body));

	reply.header("Content-Type", "application/zip");
  	reply.header("Content-Disposition", `attachment; filename="${filename}"`);

  	return reply.send(buffer);
})

fastify.setNotFoundHandler((req, reply) => {
  	if (!req.raw.url.startsWith("/api")) {
    	const indexPath = join(__basedir, "../dist/index.html");
    	reply.type("text/html").send(fs.readFileSync(indexPath));
  	} else {
    	reply.status(404).send({ error: "Not Found" });
  	}
});

try {
	await fastify.listen({ port: 3000, host: '0.0.0.0' })
} catch (err) {
  	fastify.log.error(err)
  	process.exit(1)
}
