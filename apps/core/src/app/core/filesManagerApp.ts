// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAuthApp} from 'app/auth/authApp';
import {InitQueryContextFunc} from 'app/helpers/initQueryContext';
import {IFilesManagerDomain} from 'domain/filesManager/filesManagerDomain';
import express, {Express, NextFunction, Response} from 'express';
import winston from 'winston';
import {IConfig} from '_types/config';
import {IRequestWithContext} from '_types/express';
import {IAppGraphQLSchema} from '_types/graphql';

export interface IFilesManagerApp {
    init(): Promise<void>;
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
    registerRoute(app: Express): void;
}

interface IDeps {
    'core.app.auth'?: IAuthApp;
    'core.app.helpers.initQueryContext'?: InitQueryContextFunc;
    'core.domain.filesManager'?: IFilesManagerDomain;
    'core.utils.logger'?: winston.Winston;
    config?: IConfig;
}

export default function({
    'core.domain.filesManager': filesManager,
    'core.app.helpers.initQueryContext': initQueryContext,
    'core.app.auth': authApp = null,
    'core.utils.logger': logger = null,
    config = null
}: IDeps): IFilesManagerApp {
    return {
        init: async () => filesManager.init(),
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    extend type Mutation {
                        forcePreviewsGeneration(libraryId: ID!, recordId: ID, failedOnly: Boolean): Boolean!
                    }
                `,

                resolvers: {
                    Mutation: {
                        async forcePreviewsGeneration(
                            parent,
                            {libraryId, recordId, failedOnly},
                            ctx
                        ): Promise<boolean> {
                            return filesManager.forcePreviewsGeneration({ctx, libraryId, recordId, failedOnly});
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        registerRoute(app): void {
            app.get(
                `/${config.files.originalsPathPrefix}/:libraryId/:fileId`,
                async (req: IRequestWithContext, res, next) => {
                    req.ctx = initQueryContext(req);

                    try {
                        const payload = await authApp.validateRequestToken(req);
                        req.ctx.userId = payload.userId;

                        next();
                    } catch {
                        res.status(403);
                    }
                },
                async (req: IRequestWithContext, res: Response, next: NextFunction): Promise<Response> => {
                    try {
                        // Retrieve file path from domain
                        const {libraryId, fileId} = req.params;
                        const originalPath = await filesManager.getOriginalPath({
                            ctx: req.ctx,
                            libraryId,
                            fileId
                        });

                        req.url = '/';
                        return express.static(originalPath)(req, res, next);
                    } catch (err) {
                        next(err);
                    }
                },
                async (err, req, res, next) => {
                    logger.error(`[${req.ctx.queryId}] ${err}`);
                    logger.error(err.stack);
                    res.status(err.statusCode ?? 500).send(err.type ?? 'Internal server error');
                }
            );
        }
    };
}
