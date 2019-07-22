import * as hapi from '@hapi/hapi';
import {SchemaChangeCallback} from 'apollo-server-core';
import {ApolloServer} from 'apollo-server-hapi';
import {IAuthApp} from 'app/auth/authApp';
import {IGraphqlApp} from 'app/graphql/graphqlApp';
import {execute, GraphQLError} from 'graphql';
import * as hapiAuthJwt2 from 'hapi-auth-jwt2';
import {IUtils} from 'utils/utils';
import * as uuid from 'uuid';
import * as winston from 'winston';
import {ErrorTypes} from '../_types/errors';

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
    const _handleError = (err: GraphQLError) => {
        const origErr: any = err.originalError;

        const errorType = (!!origErr && origErr.type) || ErrorTypes.INTERNAL_ERROR;
        const errorFields = (!!origErr && origErr.fields) || {};
        const errorAction = (!!origErr && origErr.action) || null;

        err.extensions.code = errorType;
        err.extensions.fields = errorFields;
        err.extensions.action = errorAction;

        if (errorType === ErrorTypes.VALIDATION_ERROR || errorType === ErrorTypes.PERMISSION_ERROR) {
            return err;
        }

        const errId = uuid.v4();

        // Error is logged with original message
        err.message = `[${errId}] ${err.message}`;
        logger.error(`${err.message}\n${err.extensions.exception.stacktrace.join('\n')}`);

        if (config.env !== 'development' && config.env !== 'test') {
            err.message = `[${errId}] Internal Error`;
        }

        return err;
    };

    return {
        async init(): Promise<void> {
            const server: hapi.Server = new hapi.Server({
                host: config.server.host,
                port: config.server.port
            });

            let _onSchemaUpdate: SchemaChangeCallback;

            try {
                // Auth Check
                await server.register(hapiAuthJwt2);
                server.auth.strategy('core', config.auth.scheme, {
                    key: config.auth.key,
                    validate: async (decode, request) => {
                        try {
                            const isValid = await authApp.validateToken(decode);
                            return {isValid};
                        } catch (e) {
                            logger.error(e);
                            throw e;
                        }
                    },
                    verifyOptions: {algorithms: ['HS256']}
                });

                // Auth App to login
                authApp.registerRoute(server);
                server.auth.default('core');

                await graphqlApp.generateSchema();

                const apolloServ = new ApolloServer({
                    debug: config.env === 'development',
                    formatError: _handleError,
                    tracing: true,
                    cacheControl: false,
                    context: ({request}) => {
                        return {
                            auth: request.auth.isAuthenticated ? request.auth.credentials : false
                        };
                    },
                    // We're using a gateway here instead of a simple schema definition because we need to be able
                    // to reload schema when a change occurs (new library, new attribute...)
                    gateway: {
                        load: () => {
                            return Promise.resolve({
                                schema: graphqlApp.schema,
                                executor: args => {
                                    return execute({
                                        ...args,
                                        schema: graphqlApp.schema,
                                        contextValue: args.context,
                                        variableValues: args.request.variables
                                    });
                                }
                            });
                        },
                        /**
                         * Init the function we want to call on schema change.
                         * The callback received here is an Apollo internal function which actually update
                         * the schema stored by Apollo Server. We assign it to _onSchemaUpdate which is called
                         * when graphqlApp emits a 'schemaUpdate' (see below).
                         */
                        onSchemaChange: callback => {
                            _onSchemaUpdate = callback;

                            return () =>
                                graphqlApp.schemaUpdateEmitter.off(graphqlApp.SCHEMA_UPDATE_EVENT, _onSchemaUpdate);
                        }
                    },
                    subscriptions: false
                });
                await apolloServ.applyMiddleware({app: server, cors: true, path: '/graphql'});

                // Listen to schemaUpdate event. The actual _onSchemaUpdate function is initialized
                // during Apollo Server instantiation (see above in the gateway)
                graphqlApp.schemaUpdateEmitter.on(graphqlApp.SCHEMA_UPDATE_EVENT, _onSchemaUpdate);

                await server.start();
                logger.info(`Server running at: ${server.info.uri}`);
            } catch (e) {
                utils.rethrow(e, 'Server init error:');
            }
        }
    };
}
