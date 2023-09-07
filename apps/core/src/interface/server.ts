// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {ApolloServerPluginCacheControlDisabled} from 'apollo-server-core';
import {AuthenticationError as ApolloAuthenticationError, ApolloServer} from 'apollo-server-express';
import {IApplicationApp} from 'app/application/applicationApp';
import {IAuthApp} from 'app/auth/authApp';
import {ICoreApp} from 'app/core/coreApp';
import {IGraphqlApp} from 'app/graphql/graphqlApp';
import {AwilixContainer} from 'awilix';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, {NextFunction, Request, Response} from 'express';
import fs from 'fs';
import {GraphQLFormattedError, execute} from 'graphql';
import {graphqlUploadExpress} from 'graphql-upload';
import * as graphqlWS from 'graphql-ws/lib/use/ws';
import {createServer} from 'http';
import {IUtils} from 'utils/utils';
import {v4 as uuidv4} from 'uuid';
import * as winston from 'winston';
import {WebSocketServer} from 'ws';
import {ACCESS_TOKEN_COOKIE_NAME, API_KEY_PARAM_NAME} from '../_types/auth';
import {ErrorTypes, IExtendedErrorMsg} from '../_types/errors';
import AuthenticationError from '../errors/AuthenticationError';

export interface IServer {
    init(): Promise<void>;
    initConsumers(): Promise<void>;
}

interface IDeps {
    config?: IConfig;
    'core.app.graphql'?: IGraphqlApp;
    'core.app.auth'?: IAuthApp;
    'core.app.application'?: IApplicationApp;
    'core.app.core'?: ICoreApp;
    'core.utils.logger'?: winston.Winston;
    'core.utils'?: IUtils;
    'core.depsManager'?: AwilixContainer;
}

export default function({
    config: config = null,
    'core.app.graphql': graphqlApp = null,
    'core.app.auth': authApp = null,
    'core.app.application': applicationApp = null,
    'core.app.core': coreApp = null,
    'core.utils.logger': logger = null,
    'core.utils': utils = null,
    'core.depsManager': depsManager = null
}: IDeps = {}): IServer {
    const _handleError = (err: GraphQLFormattedError, {context}: any) => {
        const newError = {...err};

        const isGraphlValidationError = err.extensions && err.extensions.code === 'GRAPHQL_VALIDATION_FAILED';
        const errorType = err?.extensions.exception?.type ?? ErrorTypes.INTERNAL_ERROR;
        const errorFields = err?.extensions.exception?.fields ?? {};
        const errorAction = err?.extensions.exception?.action ?? null;
        const errorCustomMessage = err?.extensions.exception?.isCustomMessage ?? false;

        // Translate errors details
        for (const [field, errorDetails] of Object.entries(errorFields)) {
            const toTranslate =
                typeof errorDetails === 'string' ? {msg: errorDetails, vars: {}} : (errorDetails as IExtendedErrorMsg);

            const lang = context.lang ?? config.lang.default;

            errorFields[field] = !errorCustomMessage ? utils.translateError(toTranslate, lang) : errorFields[field];
        }

        newError.extensions.code = errorType;
        newError.extensions.fields = errorFields;
        newError.extensions.action = errorAction;

        if (
            errorType === ErrorTypes.VALIDATION_ERROR ||
            errorType === ErrorTypes.PERMISSION_ERROR ||
            isGraphlValidationError
        ) {
            return newError;
        }

        const errId = uuidv4();

        // Error is logged with original message
        newError.message = `[${errId}] ${err.message}`;
        logger.error(`${newError.message}\n${(err.extensions.exception?.stacktrace ?? []).join('\n')}`);

        if (!config.debug) {
            newError.message = `[${errId}] Internal Error`;
            delete newError.extensions?.exception;
        }

        return newError;
    };

    const _checkAuth = async (req, res, next) => {
        try {
            await authApp.validateRequestToken({
                ...(req.query[API_KEY_PARAM_NAME] && {apiKey: String(req.query[API_KEY_PARAM_NAME])}),
                cookies: req.cookies
            });

            next();
        } catch (err) {
            next(err);
        }
    };

    return {
        async init(): Promise<void> {
            const app = express();
            const httpServer = createServer(app);

            try {
                // Express settings
                app.disable('x-powered-by');
                app.set('port', config.server.port);
                app.set('host', config.server.host);
                app.use(express.json({limit: config.server.uploadLimit}));
                app.use(express.urlencoded({extended: true, limit: config.server.uploadLimit}));
                app.use(graphqlUploadExpress());
                app.use(cookieParser());
                app.use(
                    compression({
                        threshold: 50 * 1024 // Files under 50kb won't be compressed
                    })
                );

                // CORS
                app.use((req, res, next) => {
                    res.header('Access-Control-Allow-Origin', '*');
                    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
                    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization');

                    return req.method === 'OPTIONS' ? res.sendStatus(204) : next();
                });

                // Initialize routes
                const modules = Object.keys(depsManager.registrations).filter(modName => modName.match(/^core\.app*/));
                for (const modName of modules) {
                    const appModule = depsManager.cradle[modName];

                    if (typeof appModule.registerRoute === 'function') {
                        await appModule.registerRoute(app);
                    }
                }

                app.use('/previews', [
                    _checkAuth,
                    express.static(config.preview.directory, {fallthrough: false}),
                    async (err, req, res, next) => {
                        const htmlContent = await fs.promises.readFile(__dirname + '/preview404.html', 'utf8');
                        res.status(404)
                            .type('html')
                            .send(htmlContent);
                    }
                ]);
                app.use(`/${config.export.endpoint}`, [_checkAuth, express.static(config.export.directory)]);
                app.use(`/${config.import.endpoint}`, [_checkAuth, express.static(config.import.directory)]);

                // Handling errors
                app.use((err: any, req: Request, res: Response, next: NextFunction) => {
                    if (!err) {
                        return next ? next() : res.end();
                    }

                    if (err instanceof SyntaxError) {
                        return res.status(400).json({message: err.name});
                    }

                    if (err instanceof AuthenticationError) {
                        return res.status(401).send('Unauthorized');
                    }

                    logger.error(err);
                    res.status(500).json({error: 'INTERNAL_SERVER_ERROR'}); // FIXME: format error msg?
                });

                await graphqlApp.generateSchema();

                const _executor = args =>
                    execute({
                        ...args,
                        schema: graphqlApp.schema,
                        contextValue: args.context,
                        variableValues: args.request.variables
                    }) as Promise<any>;

                // Create Web Socket Server
                const wsServer = new WebSocketServer({
                    server: httpServer,
                    path: '/graphql'
                });

                // Hand in the schema we just created and have the
                // WebSocketServer start listening.
                const serverCleanup = graphqlWS.useServer(
                    {
                        schema: graphqlApp.schema,
                        context: async (ctx: any) => {
                            try {
                                // recreate headers object from rawHeaders array
                                const headers = ctx.extra.request.rawHeaders.reduce((prev, curr, i, arr) => {
                                    return !(i % 2) ? {...prev, [curr]: arr[i + 1]} : prev;
                                }, {});

                                const apiKeyIncluded = ctx.extra.request.url.includes(`${API_KEY_PARAM_NAME}=`);
                                const cookieIncluded = headers.Cookie?.includes(ACCESS_TOKEN_COOKIE_NAME);

                                const payload = await authApp.validateRequestToken({
                                    apiKey: apiKeyIncluded ? ctx.extra.request.url.split('key=')[1] : null,
                                    cookies: cookieIncluded
                                        ? {
                                              [ACCESS_TOKEN_COOKIE_NAME]: headers.Cookie.split('=')[
                                                  headers.Cookie.split('=').indexOf(ACCESS_TOKEN_COOKIE_NAME) + 1
                                              ]
                                          }
                                        : null
                                });

                                const context: IQueryInfos = {
                                    userId: payload.userId,
                                    groupsId: payload.groupsId
                                };

                                return context;
                            } catch (e) {
                                throw new ApolloAuthenticationError('you must be logged in');
                            }
                        }
                    },
                    wsServer
                );

                const plugins = [
                    ApolloServerPluginCacheControlDisabled(),
                    {
                        async serverWillStart() {
                            return {
                                async drainServer() {
                                    await serverCleanup.dispose();
                                }
                            };
                        }
                    }
                ];

                if (config.debug) {
                    plugins.push(require('apollo-tracing').plugin());
                }

                const server = new ApolloServer({
                    // Always run in debug mode to have stacktrace in errors.
                    // Hiding error details in production is handled in _handleError
                    debug: true,
                    introspection: config.server.allowIntrospection,
                    plugins,
                    formatResponse: (resp, ctx) => {
                        const formattedResp = {...resp};

                        if (resp.errors) {
                            formattedResp.errors = resp.errors.map(e => _handleError(e, ctx));
                        }

                        const context: IQueryInfos = ctx.context;

                        if (context.dbProfiler) {
                            formattedResp.extensions = {
                                dbProfiler: {
                                    ...context.dbProfiler,
                                    // Transform queries hash map into an array, sort queries by count
                                    queries: Object.values(context.dbProfiler.queries)
                                        .map(q => ({...q, callers: [...q.callers]})) // Transform callers Set into Array
                                        .sort((a: any, b: any) => b.count - a.count)
                                }
                            };
                        }

                        return formattedResp;
                    },
                    context: async ({req, res}): Promise<IQueryInfos> => {
                        try {
                            const payload = await authApp.validateRequestToken({
                                ...(req.query[API_KEY_PARAM_NAME] && {apiKey: String(req.query[API_KEY_PARAM_NAME])}),
                                cookies: req.cookies
                            });

                            const ctx: IQueryInfos = {
                                userId: payload.userId,
                                lang: (req.query.lang as string) ?? config.lang.default,
                                defaultLang: config.lang.default,
                                queryId: req.body.requestId || uuidv4(),
                                groupsId: payload.groupsId
                            };

                            return ctx;
                        } catch (e) {
                            throw new ApolloAuthenticationError(e.message ?? 'You must be logged in');
                        }
                    },
                    // We're using a gateway here instead of a simple schema definition because we need to be able
                    // to reload schema when a change occurs (new library, new attribute...)
                    gateway: {
                        load: () =>
                            Promise.resolve({
                                schema: graphqlApp.schema,
                                executor: _executor
                            }),
                        /**
                         * Init the function we want to call on schema change.
                         * The callback received here is an Apollo internal function which actually update
                         * the schema stored by Apollo Server. We init an event listener to execute this function
                         * when a change occurs (new library, new attribute...)
                         */
                        onSchemaChange: callback => {
                            graphqlApp.schemaUpdateEmitter.on(graphqlApp.SCHEMA_UPDATE_EVENT, callback);
                            return () => graphqlApp.schemaUpdateEmitter.off(graphqlApp.SCHEMA_UPDATE_EVENT, callback);
                        },
                        stop: Promise.resolve
                    }
                });

                await server.start();
                server.applyMiddleware({app, path: '/graphql', cors: true});

                applicationApp.registerRoute(app);

                await new Promise<void>(resolve => httpServer.listen(config.server.port, resolve));
                logger.info(`🚀 Server ready at http://localhost:${config.server.port}${server.graphqlPath}`);
            } catch (e) {
                utils.rethrow(e, 'Server init error:');
            }
        },
        async initConsumers() {
            await graphqlApp.initSchemaUpdateConsumer();
            await coreApp.initPubSubEventsConsumer();
        }
    };
}
