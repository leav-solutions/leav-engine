import * as jwt from 'jsonwebtoken';
import {Server} from 'hapi';
export interface IAuthApp {
    registerRoute(server: Server): void;
}

export default function(config: any): IAuthApp {
    return {
        registerRoute(server): void {
            server.route({
                method: 'GET',
                path: '/auth/get-token',
                handler(req, h) {
                    // request handler method
                    const token = jwt.sign(
                        {
                            user: 'testuser',
                            role: 'admin'
                        },
                        config.auth.key,
                        {algorithm: config.auth.algorithm}
                    );
                    return {
                        token
                    };
                },
                options: {
                    auth: false
                }
            });
        }
    };
}
