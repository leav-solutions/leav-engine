import {graphqlHapi} from 'apollo-server-hapi';
import * as hapiAuthJwt2 from 'hapi-auth-jwt2';
import * as winston from 'winston';
import * as hapi from 'hapi';

import {IGraphqlApp} from 'app/graphql/graphqlApp';
import {IAuthApp} from 'app/auth/authApp';
import {IUtils} from 'utils/utils';

export interface IServer {
    init(): Promise<void>;
}

export default function(
    config: any,
    graphqlApp: IGraphqlApp,
    authApp: IAuthApp,
    logger: winston.Winston,
    utils: IUtils | null = null
): IServer {
    return {
        async init(): Promise<void> {
            const server: hapi.Server = new hapi.Server({
                host: config.server.host,
                port: config.server.port
            });

            try {
                // Auth Check
                await server.register(hapiAuthJwt2);
                server.auth.strategy('core', config.auth.scheme, {
                    key: config.auth.key,
                    validate: async (decode, request) => ({isValid: true}),
                    verifyOptions: {algorithms: ['HS256']}
                });
                server.auth.default('core');
                // Auth App to login
                authApp.registerRoute(server);

                await graphqlApp.generateSchema();

                // GraphQL
                await server.register({
                    plugin: graphqlHapi,
                    options: {
                        path: '/graphql',
                        // GraphqlOptions must be a function in order to have an up-to-date schema on each request
                        graphqlOptions: req => ({
                            schema: graphqlApp.schema,
                            context: {
                                auth: req.auth.isAuthenticated ? req.auth.credentials : false
                            },
                            formatError: err => {
                                const origErr = err.originalError;

                                err.fields = (origErr && origErr.fields) || {};
                                return err;
                            },
                            debug: false
                        }),
                        route: {
                            cors: true
                        }
                    }
                });

                await server.start();
                logger.info(`Server running at: ${server.info.uri}`);
            } catch (e) {
                utils.rethrow(e, 'Server init error:');
            }
        }
    };
}
