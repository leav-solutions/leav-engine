// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FileType} from '@leav/utils';
import {InitQueryContextFunc} from 'app/helpers/initQueryContext';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import express, {Express, NextFunction, Response} from 'express';
import {withFilter} from 'graphql-subscriptions';
import {FileUpload} from 'graphql-upload';
import {IConfig} from '_types/config';
import {IRequestWithContext} from '_types/express';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {IRecord, IRecordFilterLight} from '_types/record';
import {IFilesManagerDomain} from '../../domain/filesManager/filesManagerDomain';
import {TriggerNames} from '../../_types/eventsManager';
import AuthenticationError from '../../errors/AuthenticationError';
import {ValidateRequestTokenFunc} from '../helpers/validateRequestToken';

export interface IFilesManagerApp {
    init(): Promise<void>;
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
    registerRoute(app: Express): void;
}

interface IDeps {
    'core.app.helpers.initQueryContext'?: InitQueryContextFunc;
    'core.app.helpers.validateRequestToken'?: ValidateRequestTokenFunc;
    'core.domain.filesManager'?: IFilesManagerDomain;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    config?: IConfig;
}

interface IUploadParams {
    library: string;
    nodeId: string;
    files: Array<{data: Promise<FileUpload>; uid: string; size?: number; replace?: boolean}>;
}

interface ICreateDirectoryParams {
    library: string;
    name: string;
    nodeId: string;
}

export default function ({
    'core.app.helpers.initQueryContext': initQueryContext,
    'core.app.helpers.validateRequestToken': validateRequestToken = null,
    'core.domain.filesManager': filesManagerDomain = null,
    'core.domain.eventsManager': eventsManager = null,
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
                        uid: String!,
                        size: Int,
                        replace: Boolean
                    }

                    type UploadData {
                        uid: String!,
                        record: Record!
                    }

                    input UploadFiltersInput {
                        userId: ID,
                        uid: String
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
                        uid: String!,
                        userId: String!,
                        progress: StreamProgress!
                    }

                    extend type Query {
                        doesFileExistAsChild(treeId: ID!, parentNode: ID, filename: String!): Boolean
                    }



                    extend type Mutation {
                        # Force previews generation for the given records. If filters is specified, it will perform a search applying these filters and generate previews for results. If both filters and recordIds are specified, filters will be ignored. If failedOnly is true, only failed previews will be generated.
                        forcePreviewsGeneration(
                            libraryId: ID!,
                            recordIds: [ID!],
                            filters: [RecordFilterInput],
                            failedOnly: Boolean,
                            previewVersionSizeNames: [String!]
                        ): Boolean!
                        upload(library: String!, nodeId: String!, files: [FileInput!]!): [UploadData!]!
                        createDirectory(library: String!, nodeId: String!, name: String!): Record!
                    }

                    extend type Subscription {
                        upload(filters: UploadFiltersInput): UploadProgress!
                    }
                `,
                resolvers: {
                    Query: {
                        async doesFileExistAsChild(
                            _,
                            {treeId, parentNode, filename}: {treeId: string; parentNode?: string; filename: string},
                            ctx: IQueryInfos
                        ): Promise<boolean> {
                            return filesManagerDomain.doesFileExistAsChild(
                                {treeId, filename, parentNodeId: parentNode ?? null},
                                ctx
                            );
                        }
                    },
                    Mutation: {
                        async upload(
                            _,
                            {library, nodeId, files}: IUploadParams,
                            ctx: IQueryInfos
                        ): Promise<Array<{uid: string; record: IRecord}>> {
                            // progress before resolver?
                            const filesData = await Promise.all(
                                files.map(async ({data, uid, size, replace}) => ({
                                    data: await data,
                                    uid,
                                    size,
                                    replace
                                }))
                            );

                            return filesManagerDomain.storeFiles({library, nodeId, files: filesData}, ctx);
                        },
                        async createDirectory(
                            _,
                            {library, nodeId, name}: ICreateDirectoryParams,
                            ctx: IQueryInfos
                        ): Promise<IRecord> {
                            return filesManagerDomain.createDirectory({library, nodeId, name}, ctx);
                        },
                        async forcePreviewsGeneration(
                            _,
                            {
                                libraryId,
                                recordIds,
                                filters,
                                failedOnly,
                                previewVersionSizeNames
                            }: {
                                libraryId: string;
                                recordIds?: string[];
                                filters?: IRecordFilterLight[];
                                failedOnly?: boolean;
                                previewVersionSizeNames?: string[];
                            },
                            ctx: IQueryInfos
                        ): Promise<boolean> {
                            return filesManagerDomain.forcePreviewsGeneration({
                                libraryId,
                                recordIds,
                                filters,
                                failedOnly,
                                previewVersionSizeNames,
                                ctx
                            });
                        }
                    },
                    Subscription: {
                        upload: {
                            subscribe: withFilter(
                                () => eventsManager.subscribe([TriggerNames.UPLOAD_FILE]),
                                (payload, variables) => {
                                    let toReturn = true;

                                    if (typeof variables.filters?.userId !== 'undefined') {
                                        toReturn = payload.upload.userId === variables.filters.userId;
                                    }

                                    if (toReturn && typeof variables.filters?.uid !== 'undefined') {
                                        toReturn = payload.upload.uid === variables.filters.uid;
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
                        const payload = await validateRequestToken(req);
                        req.ctx.userId = payload.userId;
                        req.ctx.groupsId = payload.groupsId;

                        return next();
                    } catch {
                        return next(new AuthenticationError());
                    }
                },
                async (req: IRequestWithContext, res: Response, next: NextFunction): Promise<Response | void> => {
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
                        return next(err);
                    }
                }
            );
        }
    };
}
