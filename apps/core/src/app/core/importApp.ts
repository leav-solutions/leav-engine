// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import fs from 'fs';
import {AwilixContainer} from 'awilix';
import {StoreUploadFileFunc} from 'domain/helpers/storeUploadFile';
import {IImportDomain} from 'domain/import/importDomain';
import {FileUpload, GraphQLUpload} from 'graphql-upload';
import {IDbUtils} from 'infra/db/dbUtils';
import {nanoid} from 'nanoid';
import {IUtils} from 'utils/utils';
import * as Config from '_types/config';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {ImportMode, ImportType} from '../../_types/import';
import {TaskCallbackType} from '../../_types/tasksManager';
import {IGraphqlApp} from '../graphql/graphqlApp';

export interface ICoreImportApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
    importConfig(filepath: string, clear: boolean): Promise<void>;
    importData(filepath: string): Promise<void>;
}

interface IDeps {
    'core.domain.import': IImportDomain;
    'core.domain.helpers.storeUploadFile': StoreUploadFileFunc;
    'core.infra.db.dbUtils': IDbUtils;
    'core.utils': IUtils;
    'core.depsManager': AwilixContainer;
    'core.app.graphql': IGraphqlApp;
    config: Config.IConfig;
}

interface IImportConfigParams {
    file: Promise<FileUpload>;
    clear?: boolean;
}

interface IImportDataParams {
    file: Promise<FileUpload>;
    startAt?: number;
}

interface IImportExcelParams {
    file: Promise<FileUpload>;
    sheets?: Array<{
        type: ImportType;
        library: string;
        mode: ImportMode;
        mapping: Array<string | null>;
        keyIndex?: number;
        linkAttribute?: string;
        keyToIndex?: number;
    } | null>;
    startAt?: number;
}

export default function ({
    'core.domain.import': importDomain,
    'core.domain.helpers.storeUploadFile': storeUploadFile,
    'core.utils': utils,
    'core.depsManager': depsManager,
    'core.app.graphql': graphqlApp,
    'core.infra.db.dbUtils': dbUtils,
    config
}: IDeps): ICoreImportApp {
    const _validateFileFormat = (filename: string, allowed: string[]) => {
        const fileExtension = utils.getFileExtension(filename);

        if (!fileExtension || !allowed.includes(fileExtension)) {
            throw new ValidationError<IImportDataParams | IImportConfigParams>({
                file: {
                    msg: Errors.INVALID_FILE_FORMAT,
                    vars: {expected: allowed, received: fileExtension}
                }
            });
        }
    };

    const _importConfig = async (
        filepath: string,
        clearDatabase: boolean,
        ctx: IQueryInfos,
        forceNoTask?: boolean
    ): Promise<string> => {
        if (clearDatabase) {
            await dbUtils.clearDatabase();
        }

        // Run DB migration before doing anything
        await dbUtils.migrate(depsManager);

        return importDomain.importConfig(
            {filepath, forceNoTask, ctx},
            {
                ...(!forceNoTask && {
                    // Delete remaining import file.
                    callbacks: [
                        {
                            moduleName: 'app',
                            subModuleName: 'graphql',
                            name: 'generateSchema',
                            args: [],
                            type: [TaskCallbackType.ON_SUCCESS, TaskCallbackType.ON_FAILURE, TaskCallbackType.ON_CANCEL]
                        },
                        {
                            moduleName: 'utils',
                            name: 'deleteFile',
                            args: [filepath],
                            type: [TaskCallbackType.ON_SUCCESS, TaskCallbackType.ON_FAILURE, TaskCallbackType.ON_CANCEL]
                        }
                    ]
                })
            }
        );
    };

    return {
        importConfig: async (filepath: string, clear: boolean): Promise<void> => {
            await _importConfig(
                filepath,
                clear,
                {
                    userId: config.defaultUserId,
                    queryId: 'ImportConfig'
                },
                true
            );
        },
        importData: async (filepath: string): Promise<void> => {
            // extract filename from filepath
            let filename = filepath
                .split('/')
                .pop() as string; /* split give at least one element retrieve by pop method */
            // check if filepath is a valid file
            if (!fs.existsSync(filepath)) {
                throw new Error('File not found');
            }

            // check if file extension is allowed and rename file
            const allowedExtensions = ['json'];
            _validateFileFormat(filename, allowedExtensions);
            filename = nanoid() + '.' + utils.getFileExtension(filename);

            // copy filepath to import directory
            await fs.promises.copyFile(filepath, `${config.import.directory}/${filename}`);

            // delete original filepath
            fs.unlinkSync(filepath);

            await importDomain.importData({filename, ctx: {userId: config.defaultUserId, queryId: 'ImportData'}});
        },
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    scalar Upload

                    enum ImportType {
                        ${Object.values(ImportType).join(' ')}
                    }

                    enum ImportMode {
                        ${Object.values(ImportMode).join(' ')}
                    }

                    input SheetInput {
                        type: ImportType!
                        mode: ImportMode!
                        library: String!,
                        mapping: [String],
                        keyIndex: Int,
                        linkAttribute: String,
                        keyToIndex: Int,
                        treeLinkLibrary: String,
                    }

                    extend type Mutation {
                        importData(file: Upload!, startAt: Int): ID!
                        importConfig(file: Upload!, clear: Boolean): ID!
                        importExcel(file: Upload!, sheets: [SheetInput], startAt: Int): ID!
                    }
                `,
                resolvers: {
                    Upload: GraphQLUpload,
                    Mutation: {
                        async importConfig(
                            _,
                            {file, clear = false}: IImportConfigParams,
                            ctx: IQueryInfos
                        ): Promise<string> {
                            const fileData: FileUpload = await file;
                            const allowedExtensions = ['json'];

                            _validateFileFormat(fileData.filename, allowedExtensions);
                            fileData.filename = nanoid() + '.' + utils.getFileExtension(fileData.filename);

                            // Store JSON file in local filesystem.
                            await storeUploadFile(fileData, config.import.directory);

                            return _importConfig(`${config.import.directory}/${fileData.filename}`, clear, ctx);
                        },
                        async importData(_, {file, startAt}: IImportDataParams, ctx: IQueryInfos): Promise<string> {
                            const fileData: FileUpload = await file;

                            const allowedExtensions = ['json'];
                            _validateFileFormat(fileData.filename, allowedExtensions);

                            fileData.filename = nanoid() + '.' + utils.getFileExtension(fileData.filename);

                            // Store JSON file in local filesystem.
                            await storeUploadFile(fileData, config.import.directory);

                            return importDomain.importData(
                                {filename: fileData.filename, ctx},
                                {
                                    // Delete remaining import file.
                                    ...(!!startAt && {startAt}),
                                    callbacks: [
                                        {
                                            moduleName: 'utils',
                                            name: 'deleteFile',
                                            args: [`${config.import.directory}/${fileData.filename}`],
                                            type: [
                                                TaskCallbackType.ON_SUCCESS,
                                                TaskCallbackType.ON_FAILURE,
                                                TaskCallbackType.ON_CANCEL
                                            ]
                                        }
                                    ]
                                }
                            );

                            // FIXME: If import fail should we backup database?
                        },
                        async importExcel(
                            _,
                            {file, sheets, startAt}: IImportExcelParams,
                            ctx: IQueryInfos
                        ): Promise<string> {
                            const fileData: FileUpload = await file;

                            const allowedExtensions = ['xlsx'];
                            _validateFileFormat(fileData.filename, allowedExtensions);

                            fileData.filename = nanoid() + '.' + utils.getFileExtension(fileData.filename);

                            // Store XLSX file in local filesystem.
                            await storeUploadFile(fileData, config.import.directory);

                            return importDomain.importExcel({filename: fileData.filename, sheets, startAt}, ctx);
                        }
                    }
                }
            };

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        }
    };
}
