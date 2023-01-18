// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FileType} from '@leav/utils';
import {IAuthApp} from 'app/auth/authApp';
import {InitQueryContextFunc} from 'app/helpers/initQueryContext';
import {IFilesManagerDomain, TRIGGER_NAME_UPLOAD_FILE} from '../../domain/filesManager/filesManagerDomain';
import express, {Express, NextFunction, Response} from 'express';
import winston from 'winston';
import {IConfig} from '_types/config';
import {IRequestWithContext} from '_types/express';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {API_KEY_PARAM_NAME} from '../../_types/auth';
import {FileUpload} from 'graphql-upload';
import {withFilter} from 'graphql-subscriptions';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';

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
    'core.domain.eventsManager'?: IEventsManagerDomain;
}

interface IUploadParams {
    library: string;
    path: string;
    files: Array<{data: Promise<FileUpload>; size?: number; replace?: boolean}>;
}

export default function ({
    'core.domain.filesManager': filesManagerDomain = null,
    'core.app.helpers.initQueryContext': initQueryContext,
    'core.app.auth': authApp = null,
    'core.domain.eventsManager': eventsManager = null,
    'core.utils.logger': logger = null,
    config = null
}: IDeps): IFilesManagerApp {
    return {
        init: async () => filesManagerDomain.init(),
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    enum FileType {
                        ${Object.values(FileType).join(' ')}
                    }

                    input FileInput {
                        data: Upload!,
                        size: Int,
                        replace: Boolean
                    }

                    type UploadList {
                        filename: String!,
                        recordId: String!
                    }

                    extend type Mutation {
                        forcePreviewsGeneration(libraryId: ID!, recordId: ID, failedOnly: Boolean): Boolean!
                        upload(library: String!, path: String!, files: [FileInput!]!): [UploadList!]!
                    }

                    input UploadFiltersInput {
                        userId: ID,
                        originalFilename: String
                    }

                    type StreamProgress {
                        percentage: Int,
                        transferred: Int,
                        length: Int,
                        remaining: Int,
                        eta: Int,
                        runtime: Int,
                        delta: Int,
                        speed: Int
                    }

                    type UploadProgress {
                        originalFilename: String!,
                        userId: String!,
                        progress: StreamProgress!
                    }

                    extend type Subscription {
                        upload(filters: UploadFiltersInput): UploadProgress!
                    }
                `,
                resolvers: {
                    Mutation: {
                        async upload(
                            _,
                            {library, path, files}: IUploadParams,
                            ctx: IQueryInfos
                        ): Promise<Array<{filename: string; recordId: string}>> {
                            // progress before resolver?
                            const filesData = await Promise.all(
                                files.map(async ({data, size, replace}) => ({
                                    data: await data,
                                    size,
                                    replace
                                }))
                            );

                            return filesManagerDomain.storeFiles({library, path, files: filesData}, ctx);
                        },
                        async forcePreviewsGeneration(
                            parent,
                            {libraryId, recordId, failedOnly},
                            ctx
                        ): Promise<boolean> {
                            return filesManagerDomain.forcePreviewsGeneration({ctx, libraryId, recordId, failedOnly});
                        }
                    },
                    Subscription: {
                        upload: {
                            subscribe: withFilter(
                                () => eventsManager.suscribe([TRIGGER_NAME_UPLOAD_FILE]),
                                (payload, variables) => {
                                    let toReturn = true;

                                    if (typeof variables.filters?.userId !== 'undefined') {
                                        toReturn = payload.userId === variables.filters.userId;
                                    }

                                    if (toReturn && typeof variables.filters?.originalFilename !== 'undefined') {
                                        toReturn = payload.originalFilename === variables.filters.originalFilename;
                                    }

                                    return toReturn;
                                }
                            )
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
                        const payload = await authApp.validateRequestToken({
                            apiKey: String(req.query[API_KEY_PARAM_NAME]),
                            cookies: req.cookies
                        });
                        req.ctx.userId = payload.userId;
                        req.ctx.groupsId = payload.groupsId;

                        next();
                    } catch {
                        res.status(403);
                    }
                },
                async (req: IRequestWithContext, res: Response, next: NextFunction): Promise<Response> => {
                    try {
                        // Retrieve file path from domain
                        const {libraryId, fileId} = req.params;
                        const originalPath = await filesManagerDomain.getOriginalPath({
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
