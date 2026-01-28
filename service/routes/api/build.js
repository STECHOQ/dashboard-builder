import { join } from 'node:path';
const { default: buildLib } = await import(join(__basedir, '/lib/build.js'))

export default async (fastify, options) => {
	fastify.post('/', async (request, reply) => {
		const { filename, buffer } = await buildLib.init(JSON.parse(request.body));

		reply.header("Content-Type", "application/zip");
  		reply.header("Content-Disposition", `attachment; filename="${filename}"`);

  		return reply.send(buffer);
	})

	fastify.get('/', async (request, reply) => {
		return {
			status: true
    	};
	})
}
