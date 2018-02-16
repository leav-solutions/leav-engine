import {graphiqlHapi, graphqlHapi} from 'apollo-server-hapi';
import * as winston from 'winston';
import * as hapi from 'hapi';

import * as Debugger from 'debug';
import {IGraphqlApp} from 'app/graphql/graphqlApp';
const debug = Debugger('core:server');

export interface IServer {
    init(): Promise<void>;
}

export default function(config: any, graphqlApp: IGraphqlApp, logger: winston.Winston): IServer {
    return {
        async init(): Promise<void> {
            const server: hapi.Server = new hapi.Server();

            try {
                server.connection({
                    host: config.server.host,
                    port: config.server.port
                });

                await graphqlApp.generateSchema();

                // GraphQL
                await server.register({
                    register: graphqlHapi,
                    options: {
                        path: '/graphql',
                        graphqlOptions: {
                            schema: graphqlApp.schema
                        },
                        route: {
                            cors: true
                        }
                    }
                });

                // GraphiQL
                await server.register({
                    register: graphiqlHapi,
                    options: {
                        path: '/graphiql',
                        graphiqlOptions: {
                            endpointURL: '/graphql'
                        }
                    }
                });

                await server.start(err => {
                    if (err) {
                        throw err;
                    }

                    logger.info(`Server running at: ${server.info.uri}`);
                });
            } catch (e) {
                throw new Error('Server init error' + e);
            }
        }
    };
}
