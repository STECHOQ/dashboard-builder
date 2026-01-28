import Fastify from 'fastify';
import fastifyStatic from "@fastify/static";
import secureSession from '@fastify/secure-session';
import fastifyCookie from '@fastify/cookie';
import fs from "fs";
import path from 'path';
import { join } from 'node:path';
import { randomBytes } from 'crypto';

class FASTIFY {

	async init(config){
		const self = this;

		const { port, host, staticConfig, logger, routes, useStatelessSession, useStatefulSession } = config;
		const { preRouteMiddleware, postRouteMiddleware } = config;

		const fastify = Fastify({
  			logger: logger ?? true
		})

		if(useStatelessSession){
			const { keyPath, expiry, cookie } = useStatelessSession;

			if (!fs.existsSync(keyPath)) {
  				const newKey = randomBytes(32); 
  				fs.writeFileSync(keyPath, newKey);
			}

			const sessionKey = fs.readFileSync(keyPath);

			fastify.register(secureSession, {
  				key: sessionKey,
				expiry,
  				cookie: { 
  					path: '/', 
  					httpOnly: true,
  					secure: process.env.NODE_ENV === 'production',
  					...cookie
  				}
			});
		}

		if(useStatefulSession){
			fastify.register(fastifyCookie);
		}

		if(preRouteMiddleware){
			await preRouteMiddleware(fastify);
		}

		const routers = self.getAllRouters({root: '/', __path: routes});
		for (const mainRoute in routers) {
            for(const subRoute in routers[mainRoute]){
				const _route = {
					path: `${mainRoute === '/' ? '' : mainRoute}/${subRoute}`,
					required: routers[mainRoute][subRoute],
				};

				fastify.register(
					await import(_route.required),
					{ prefix: _route.path }
				)
				
            }
        }	

		if(staticConfig){
			const { root, prefix } = staticConfig;

			if(root && prefix){
				fastify.register(fastifyStatic, {
					root: root,
  					prefix: prefix,
				});
			}
		}

		if(postRouteMiddleware){
			await postRouteMiddleware(fastify);
		}

		await fastify.listen({ port: port ?? 3000, host: host ?? '0.0.0.0' });

	}

    getRoutersSync(__path,) {
        const files = {};
        const _extensions = [ '.js', '.ts', '.json' ];

        //using sync, because it's only run when server is starting up and I dont want to get unnecessary headache
        fs.readdirSync(__path)
            .forEach(file => {
                const stats = fs.statSync(__path + '/' + file);

                if (stats.isFile() && _extensions.includes(path.extname(file))) {
                    files[path.basename(file, path.extname(file))] = path.resolve(__path, file);
                } else if (stats.isDirectory()) {
                    //if file is a directory, recursively get all files inside it and add them into object
                    const tmp = this.getRoutersSync(path.resolve(__path, file));
                    for (let key in tmp) {
                        files[path.basename(file, path.extname(file)) + '/' + key] = tmp[key];
                    }
                }
            });

        return files;
    };

    getAllRouters({root = '/', __path}) {
		const rootRoutes = {}
		rootRoutes[root] = this.getRoutersSync(__path, '.js')
		return rootRoutes
	};

}

export default new FASTIFY();
