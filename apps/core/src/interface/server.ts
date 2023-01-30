// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloServerPlugin} from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import {ApolloServerPluginCacheControlDisabled} from 'apollo-server-core';
import {ApolloServer, AuthenticationError as ApolloAuthenticationError} from 'apollo-server-express';
import {IApplicationApp} from 'app/application/applicationApp';
import {IAuthApp} from 'app/auth/authApp';
import {ICoreApp} from 'app/core/coreApp';
import {IGraphqlApp} from 'app/graphql/graphqlApp';
import {AwilixContainer} from 'awilix';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import PermissionError from 'errors/PermissionError';
import ValidationError from 'errors/ValidationError';
import express, {NextFunction, Request, Response} from 'express';
import fs from 'fs';
import {execute, GraphQLError, GraphQLFormattedError} from 'graphql';
import {graphqlUploadExpress} from 'graphql-upload';
import {ServerOptions} from 'graphql-ws';
import * as graphqlWS from 'graphql-ws/lib/use/ws';
import {createServer, Server} from 'http';
import {IUtils} from 'utils/utils';
import {v4 as uuidv4} from 'uuid';
import * as winston from 'winston';
import {WebSocketServer} from 'ws';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import AuthenticationError from '../errors/AuthenticationError';
import LeavError from '../errors/LeavError';
import {ACCESS_TOKEN_COOKIE_NAME, API_KEY_PARAM_NAME} from '../_types/auth';
import {ErrorTypes, IExtendedErrorMsg} from '../_types/errors';

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
    let _currentApolloMiddleware: express.RequestHandler;
    let _currentGraphqlWsServer: ReturnType<typeof graphqlWS.useServer>;

    const _handleError = (err: GraphQLError, context: IQueryInfos): GraphQLFormattedError => {
        const newError = {...err};
        const originalError = err.originalError;

        const isGraphlValidationError = err.extensions && err.extensions.code === 'GRAPHQL_VALIDATION_FAILED';
        const errorType = (originalError as LeavError<unknown>)?.type ?? ErrorTypes.INTERNAL_ERROR;
        const errorFields = (originalError as LeavError<unknown>)?.fields ?? {};
        const errorAction = (originalError as PermissionError<unknown>)?.action ?? null;
        const errorCustomMessage = (originalError as ValidationError<unknown>)?.isCustomMessage ?? false;

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
        // @ts-ignore
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

    // The schema is dynamic and might change at runtime, like on library create. As Apollo doesn't support schema
    // updates easily, we need to recreate the middleware with a new ApolloServer each time the schema is updated.
    const _initExpressMiddleware = async (httpServer: Server, wsServer: WebSocketServer, firstCall = false) => {
        _currentGraphqlWsServer = graphqlWS.useServer(
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
                        throw new GraphQLError('You must be logged in', {
                            extensions: {
                                code: 'UNAUTHENTICATED',
                                http: {status: 401}
                            }
                        });
                    }
                }
            },
            wsServer
        );

        const responseFormattingPlugin: ApolloServerPlugin<IQueryInfos> = {
            async requestDidStart() {
                return {
                    async willSendResponse(requestContext) {
                        const {response, contextValue} = requestContext;

                        if (contextValue.dbProfiler && response.body.kind === 'single') {
                            response.body.singleResult.extensions = {
                                ...response.body.singleResult.extensions,
                                dbProfiler: {
                                    ...contextValue.dbProfiler,
                                    // Transform queries hash map into an array, sort queries by count
                                    queries: Object.values(contextValue.dbProfiler.queries)
                                        .map(q => ({...q, callers: [...q.callers]})) // Transform callers Set into Array
                                        .sort((a: any, b: any) => b.count - a.count)
                                }
                            };
                        }
                    },
                    async didEncounterErrors(requestContext) {
                        const {contextValue} = requestContext;
                        let {errors} = requestContext;

                        // Format and translate errors before sending them to client
                        if (errors) {
                            errors = errors.map(e => {
                                const formattedError = _handleError(e, contextValue);
                                e = Object.assign(e, {
                                    extensions: {...e.extensions, ...formattedError.extensions},
                                    message: formattedError.message
                                });

                                return e;
                            });
                        }

                        return;
                    }
                };
            }
        };

        const plugins = [
            ApolloServerPluginCacheControlDisabled(),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            // This will turn off all listeners to wsServer and actually close the wsServer
                            await _currentGraphqlWsServer.dispose();
                        }
                    };
                }
            },
            responseFormattingPlugin
        ];

        if (config.debug) {
            plugins.push(require('apollo-tracing').plugin());
        }

        const server = new ApolloServer<IQueryInfos>({
            // Hiding error details in production is handled in _handleError
            includeStacktraceInErrorResponses: true,
            introspection: config.server.allowIntrospection,
            schema: graphqlApp.schema,
            plugins,
            csrfPrevention: true,
            // To avoid adding listeners to SIGINT and SIGTERM events on each schema update (leading to memory leaks),
            // we only add them on the first call
            stopOnTerminationSignals: firstCall
        });

        await server.start();

        const newMiddleware = expressMiddleware(server, {
            context: async ({req, res}): Promise<IQueryInfos> => {
                try {
                    const payload = await authApp.validateRequestToken({
                        apiKey: String(req.query[API_KEY_PARAM_NAME]),
                        cookies: req.cookies
                    });

                    const ctx: IQueryInfos = {
                        userId: payload.userId,
                        lang: (req.query.lang as string) ?? config.lang.default,
                        queryId: req.body.requestId || uuidv4(),
                        groupsId: payload.groupsId
                    };

                    return ctx;
                } catch (e) {
                    throw new GraphQLError(e.message ?? 'You must be logged in', {
                        extensions: {
                            code: 'UNAUTHENTICATED',
                            http: {status: 401}
                        }
                    });
                }
            }
        });

        // Calling useServer() adds a listener to the wsServer.
        // To avoid memory leaks, we keep only the last listener for each event.
        // We don't remove all listeners to keep the active one
        // We cannot call the dispose function returned by useServer() as it would close the web socket server.
        const listenersEventNames = wsServer.eventNames();
        for (const eventName of listenersEventNames) {
            const listeners = wsServer.listeners(eventName);
            if (listeners.length > 1) {
                wsServer.removeAllListeners(eventName);
                wsServer.on(eventName, listeners[listeners.length - 1] as (...args: any[]) => void);
            }
        }

        _currentApolloMiddleware = newMiddleware;
    };

    return {
        async init(): Promise<void> {
            const app = express();
            const httpServer = createServer(app);
            const wsServer = new WebSocketServer({
                server: httpServer,
                path: '/graphql'
            });
            wsServer.setMaxListeners(10);

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
                    res.status(500).json({error: 'INTERNAL_SERVER_ERROR'});
                });

                await graphqlApp.generateSchema();

                const _executor = args =>
                    execute({
                        ...args,
                        schema: graphqlApp.getSchema,
                        contextValue: args.context,
                        variableValues: args.request.variables
                    }) as Promise<any>;

                const wsServerOptions: ServerOptions<null, {leavCtx?: IQueryInfos} & graphqlWS.Extra> = {
                    schema: graphqlApp.getSchema,
                    onConnect: async ctx => {
                        // Check auth
                        try {
                            // Recreate headers object from rawHeaders array
                            const headers: Record<string, string> = ctx.extra.request.rawHeaders.reduce(
                                (prev, curr, i, arr) => {
                                    return !(i % 2) ? {...prev, [curr]: arr[i + 1]} : prev;
                                },
                                {}
                            );

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

                            // Store context in extra to retrieve it later on
                            ctx.extra = {...ctx.extra, leavCtx: context};

                            return true;
                        } catch (e) {
                            return false; // Will close connection with a "4403 Forbidden" error
                        }
                    },
                    context: async ctx => {
                        // Extract relevant context from extra
                        return ctx.extra.leavCtx;
                    }
                };

                // Init GraphQL WS server
                const serverCleanup = graphqlWS.useServer(wsServerOptions, wsServer);

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
                logger.info(`🚀 Server ready at http://localhost:${config.server.port}/graphql`);
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
