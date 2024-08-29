// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloServer, ApolloServerPlugin} from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import {ApolloServerPluginCacheControlDisabled} from '@apollo/server/plugin/disabled';
import {IApplicationApp} from 'app/application/applicationApp';
import {IAuthApp} from 'app/auth/authApp';
import {ICoreApp} from 'app/core/coreApp';
import {IGraphqlApp} from 'app/graphql/graphqlApp';
import {AwilixContainer} from 'awilix';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {NextFunction, Response} from 'express';
import fs from 'fs';
import {GraphQLError} from 'graphql';
import {graphqlUploadExpress} from 'graphql-upload';
import {ServerOptions} from 'graphql-ws';
import * as graphqlWS from 'graphql-ws/lib/use/ws';
import {createServer} from 'http';
import {IUtils} from 'utils/utils';
import * as winston from 'winston';
import {WebSocketServer} from 'ws';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import AuthenticationError from '../errors/AuthenticationError';
import {ACCESS_TOKEN_COOKIE_NAME, API_KEY_PARAM_NAME} from '../_types/auth';
import {IRequestWithContext} from '../_types/express';
import PermissionError from '../errors/PermissionError';
import ValidationError from '../errors/ValidationError';
import type {ValidateRequestTokenFunc} from '../app/helpers/validateRequestToken';
import {HandleGraphqlErrorFunc} from './helpers/handleGraphqlError';
import {InitQueryContextFunc} from 'app/helpers/initQueryContext';

export interface IServer {
    init(): Promise<void>;
    initConsumers(): Promise<void>;
}

interface IDeps {
    config?: IConfig;
    'core.interface.helpers.handleGraphqlError'?: HandleGraphqlErrorFunc;
    'core.app.graphql'?: IGraphqlApp;
    'core.app.auth'?: IAuthApp;
    'core.app.application'?: IApplicationApp;
    'core.app.core'?: ICoreApp;
    'core.app.helpers.validateRequestToken'?: ValidateRequestTokenFunc;
    'core.app.helpers.initQueryContext'?: InitQueryContextFunc;
    'core.utils.logger'?: winston.Winston;
    'core.utils'?: IUtils;
    'core.depsManager'?: AwilixContainer;
}

export default function ({
    config: config = null,
    'core.interface.helpers.handleGraphqlError': handleGraphqlError = null,
    'core.app.graphql': graphqlApp = null,
    'core.app.auth': authApp = null,
    'core.app.application': applicationApp = null,
    'core.app.core': coreApp = null,
    'core.app.helpers.validateRequestToken': validateRequestToken = null,
    'core.app.helpers.initQueryContext': initQueryContext = null,
    'core.utils.logger': logger = null,
    'core.utils': utils = null,
    'core.depsManager': depsManager = null
}: IDeps = {}): IServer {
    const _checkAuth = async (req, res, next) => {
        try {
            await validateRequestToken(req, res);

            return next();
        } catch (err) {
            return next(err);
        }
    };

    const _extractAccessTokenFromCookiesString = (cookies: string) => {
        const accessTokenPart = cookies.split('; ').find(s => s.startsWith('accessToken='));
        if (!accessTokenPart) {
            return null;
        }
        return accessTokenPart.substring('accessToken='.length);
    };

    return {
        async init(): Promise<void> {
            const app = express();
            const httpServer = createServer(app);
            const wsServer = new WebSocketServer({
                server: httpServer,
                path: '/graphql'
            });

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

                // CORS - see https://expressjs.com/en/resources/middleware/cors.html#configuring-cors-w-dynamic-origin
                app.use(
                    cors<cors.CorsRequest>({
                        origin: true, // Allows the request origin in Access-Control-Allow-Origin
                        credentials: true, // Allows client to send cookies in cross-origin request
                        methods: 'POST, GET, PUT, DELETE, OPTIONS',
                        allowedHeaders: 'Origin, Content-Type, Authorization'
                    })
                );

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
                        res.status(404).type('html').send(htmlContent);
                    }
                ]);
                app.use(`/${config.export.endpoint}`, [_checkAuth, express.static(config.export.directory)]);
                app.use(`/${config.import.endpoint}`, [_checkAuth, express.static(config.import.directory)]);

                // Handling errors
                app.use(
                    (
                        err:
                            | undefined
                            | ValidationError<unknown>
                            | AuthenticationError
                            | PermissionError<unknown>
                            | Error,
                        req: IRequestWithContext<unknown>,
                        res: Response<unknown>,
                        next?: NextFunction
                    ) => {
                        if (!err) {
                            return next ? next() : res.end();
                        }

                        if (err instanceof ValidationError) {
                            return res.status(400).json({error: err.message});
                        }

                        if (err instanceof AuthenticationError) {
                            return res.status(401).json({error: err.message});
                        }

                        if (err instanceof PermissionError) {
                            return res.status(403).json({error: 'FORBIDDEN'});
                        }

                        logger.error(`[${req.ctx?.queryId ?? 'unknown_query'}] ${err}`);
                        logger.error(err.stack);
                        res.status(500).json({error: 'INTERNAL_SERVER_ERROR'});
                    }
                );

                const schema = await graphqlApp.getSchema();

                const wsServerOptions: ServerOptions<null, {leavCtx?: IQueryInfos} & graphqlWS.Extra> = {
                    schema,
                    onConnect: async ctx => {
                        // Check auth
                        try {
                            // Recreate headers object from rawHeaders array
                            const headers: Record<string, string> = ctx.extra.request.rawHeaders.reduce(
                                (prev, curr, i, arr) => (!(i % 2) ? {...prev, [curr]: arr[i + 1]} : prev),
                                {}
                            );

                            const apiKeyIncluded = ctx.extra.request.url.includes(`${API_KEY_PARAM_NAME}=`);
                            const cookieIncluded = headers.Cookie?.includes(ACCESS_TOKEN_COOKIE_NAME);

                            const payload = await authApp.validateRequestToken(
                                {
                                    apiKey: apiKeyIncluded ? ctx.extra.request.url.split('key=')[1] : null,
                                    cookies: cookieIncluded
                                        ? {
                                              [ACCESS_TOKEN_COOKIE_NAME]: _extractAccessTokenFromCookiesString(
                                                  headers.Cookie
                                              )
                                          }
                                        : null
                                },
                                null
                            );

                            const context: IQueryInfos = {
                                ...initQueryContext(),
                                userId: payload.userId,
                                groupsId: payload.groupsId
                            };

                            // Store context in extra to retrieve it later on
                            ctx.extra = {...ctx.extra, leavCtx: context};

                            return true;
                        } catch (e) {
                            return false; // Will close connection with a "403 Forbidden" error
                        }
                    },
                    context: async ctx =>
                        // Extract relevant context from extra
                        ctx.extra.leavCtx
                };

                const graphqlWsServer = graphqlWS.useServer(wsServerOptions, wsServer);

                const responseFormattingPlugin: ApolloServerPlugin<IQueryInfos> = {
                    async requestDidStart() {
                        return {
                            async willSendResponse(requestContext) {
                                const {response, contextValue} = requestContext;

                                if (response.body.kind !== 'single') {
                                    return;
                                }

                                if (contextValue.errors?.length) {
                                    response.body.singleResult.errors = [
                                        ...(response.body.singleResult.errors ?? []),
                                        ...(contextValue.errors ?? []).map(err => {
                                            const gqlErr = new GraphQLError(err.message, {originalError: err});
                                            return handleGraphqlError(gqlErr, contextValue);
                                        })
                                    ];
                                }

                                if (contextValue.dbProfiler) {
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
                                        const formattedError = handleGraphqlError(e, contextValue);
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
                                    await graphqlWsServer.dispose();
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
                    schema,
                    plugins,
                    csrfPrevention: true
                });

                await server.start();

                app.use(
                    '/graphql',
                    express.json(),
                    expressMiddleware(server, {
                        context: async ({req, res}): Promise<IQueryInfos> => {
                            try {
                                const payload = await validateRequestToken(req, res);

                                const ctx: IQueryInfos = {
                                    ...initQueryContext(req),
                                    userId: payload.userId,
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
                    })
                );

                applicationApp.registerRoute(app);

                await new Promise<void>(resolve => httpServer.listen(config.server.port, resolve));
                logger.info(`🚀 Server ready at http://localhost:${config.server.port}/graphql`);
            } catch (e) {
                utils.rethrow(e, 'Server init error:');
            }
        },
        async initConsumers() {
            await coreApp.initPubSubEventsConsumer();
        }
    };
}
