import {graphiqlHapi, graphqlHapi} from 'apollo-server-hapi';
import * as winston from 'winston';
import * as hapi from 'hapi';

import {IGraphqlApp} from 'app/graphql/graphqlApp';
import {IUtils} from 'utils/utils';

export interface IServer {
    init(): Promise<void>;
}

export default function(
    config: any,
    graphqlApp: IGraphqlApp,
    logger: winston.Winston,
    utils: IUtils | null = null
): IServer {
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
                        // GraphqlOptions must be a function in order to have an up-to-date schema on each request
                        graphqlOptions: req => ({
                            schema: graphqlApp.schema,
                            formatError: err => {
                                const origErr = err.originalError;

                                err.fields = (origErr && origErr.fields) || [];
                                return err;
                            },
                            debug: false
                        }),
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
                utils.rethrow(e, 'Server init error:');
            }
        }
    };
}
