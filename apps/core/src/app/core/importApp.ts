// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import fs from 'fs';
import {type StoreUploadFileFunc} from 'domain/helpers/storeUploadFile';
import {type IImportDomain} from 'domain/import/importDomain';

// eslint-disable-next-line import/extensions
import {type FileUpload} from 'graphql-upload/Upload.mjs';

// eslint-disable-next-line import/extensions
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import {nanoid} from 'nanoid';
import {type IUtils} from 'utils/utils';
import type * as Config from '_types/config';
import {type IAppGraphQLSchema} from '_types/graphql';
import {type IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {ImportMode, ImportType} from '../../_types/import';
import {TaskCallbackType} from '../../_types/tasksManager';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';
import {type GetSystemQueryContext} from '../../utils/helpers/getSystemQueryContext';

export interface ICoreImportApp extends IGraphqlAppModule {
    importConfig(filepath: string, clear: boolean): Promise<void>;
    importData(filepath: string): Promise<void>;
}

interface IDeps {
    'core.domain.import': IImportDomain;
    'core.domain.helpers.storeUploadFile': StoreUploadFileFunc;
    'core.utils': IUtils;
    config: Config.IConfig;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
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
    'core.utils.getSystemQueryContext': getSystemQueryContext,
    config,
}: IDeps): ICoreImportApp {
    const _validateFileFormat = (filename: string, allowed: string[]) => {
        const fileExtension = utils.getFileExtension(filename);

        if (!fileExtension || !allowed.includes(fileExtension)) {
            throw new ValidationError<IImportDataParams | IImportConfigParams>({
                file: {
                    msg: Errors.INVALID_FILE_FORMAT,
                    vars: {expected: allowed, received: fileExtension},
                },
            });
        }
    };

    const _importConfig = async (
        filepath: string,
        clearDatabase: boolean,
        ctx: IQueryInfos,
        forceNoTask?: boolean,
    ): Promise<string | undefined> =>
        importDomain.importConfig(
            {filepath, forceNoTask, clearDatabase, dbMigrate: true, ctx},
            {
                ...(!forceNoTask && {
                    // Delete remaining import file.
                    callbacks: [
                        {
                            moduleName: 'app',
                            subModuleName: 'graphql',
                            name: 'generateSchema',
                            args: [],
                            type: [
                                TaskCallbackType.ON_SUCCESS,
                                TaskCallbackType.ON_FAILURE,
                                TaskCallbackType.ON_CANCEL,
                            ],
                        },
                        {
                            moduleName: 'utils',
                            name: 'deleteFile',
                            args: [filepath],
                            type: [
                                TaskCallbackType.ON_SUCCESS,
                                TaskCallbackType.ON_FAILURE,
                                TaskCallbackType.ON_CANCEL,
                            ],
                        },
                    ],
                }),
            },
        );

    return {
        importConfig: async (filepath: string, clear: boolean): Promise<void> => {
            await _importConfig(filepath, clear, getSystemQueryContext('importConfig'), true);
        },
        importData: async (filepath: string): Promise<void> => {
            // extract filename from filepath
            let filename = filepath
                .split('/')
                .pop() as string; /* split give at least one element retrieve by pop method */

            if (!(await utils.fileExists(filepath))) {
                throw new Error('File not found');
            }

            // check if file extension is allowed and rename file
            const allowedExtensions = ['json'];
            _validateFileFormat(filename, allowedExtensions);
            filename = nanoid() + '.' + utils.getFileExtension(filename);

            // copy filepath to import directory
            await fs.promises.copyFile(filepath, `${config.import.directory}/${filename}`);

            // delete original filepath
            await fs.promises.unlink(filepath);

            await importDomain.importData({filename, ctx: getSystemQueryContext('importData')});
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
                            ctx: IQueryInfos,
                        ): Promise<string | undefined> {
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
                                                TaskCallbackType.ON_CANCEL,
                                            ],
                                        },
                                    ],
                                },
                            );

                            // FIXME: If import fail should we backup database?
                        },
                        async importExcel(
                            _,
                            {file, sheets, startAt}: IImportExcelParams,
                            ctx: IQueryInfos,
                        ): Promise<string> {
                            const fileData: FileUpload = await file;

                            const allowedExtensions = ['xlsx'];
                            _validateFileFormat(fileData.filename, allowedExtensions);

                            fileData.filename = nanoid() + '.' + utils.getFileExtension(fileData.filename);

                            // Store XLSX file in local filesystem.
                            await storeUploadFile(fileData, config.import.directory);

                            return importDomain.importExcel({filename: fileData.filename, sheets, startAt}, ctx);
                        },
                    },
                },
            };

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        },
    };
}
