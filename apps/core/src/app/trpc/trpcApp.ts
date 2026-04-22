// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAppModule} from '@leav/core/_types/shared';
import {initTRPC, TRPCError} from '@trpc/server';
import {type IQueryInfos} from '@leav/core/_types/queryInfos';
import {type CreateExpressContextOptions, createExpressMiddleware} from '@trpc/server/adapters/express';
import {type Handler} from 'express';
import {type IConfig} from '@leav/core/_types/config';
import {type ILogger} from '@leav/logger';

export interface ITRPCApp extends IAppModule {
    createExpressHandler: (initContext: (opts: CreateExpressContextOptions) => Promise<IQueryInfos>) => Handler;
}

const createTrpc = (config: IConfig) =>
    initTRPC.context<IQueryInfos>().create({
        sse: {
            ping: {
                enabled: true,
                intervalMs: config.server.trpc.ssePingIntervalMs,
            },
        },
    });

export type TTrpc = ReturnType<typeof createTrpc>;
export type ITRPCRouterFactory = (trpc: TTrpc) => ReturnType<TTrpc['router']>;
interface IDeps {
    config: IConfig;
    'core.utils.logger'?: ILogger;
}

export default function ({config, 'core.utils.logger': logger = null}: IDeps): ITRPCApp {
    const t = createTrpc(config);
    const trpcRouters: Array<ReturnType<typeof t.router>> = [];
    return {
        createExpressHandler(initContext) {
            return createExpressMiddleware({
                router: t.mergeRouters(...trpcRouters),
                createContext: opts =>
                    initContext(opts).catch(() => {
                        throw new TRPCError({code: 'UNAUTHORIZED'});
                    }),
                onError: ({path, type, error, ctx}) => {
                    if (logger) {
                        const queryId = ctx?.queryId ?? 'unknown_query';
                        logger.error(`tRPC error [${queryId}] ${type} ${path}: ${error.message}`, {
                            stack: error.stack,
                            code: error.code,
                            path,
                            type,
                        });
                    }
                },
            });
        },
        extensionPoints: {
            registerTRPCRouter: (initRouter: ITRPCRouterFactory) => {
                trpcRouters.push(initRouter(t));
            },
        },
    };
}
