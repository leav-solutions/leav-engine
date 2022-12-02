// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IImportDomain} from 'domain/import/importDomain';
import fs from 'fs';
import {GraphQLUpload} from 'graphql-upload';
import {nanoid} from 'nanoid';
import * as Config from '_types/config';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {TaskCallbackType} from '../../_types/tasksManager';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {IFileUpload, ImportMode, ImportType} from '../../_types/import';

export interface ICoreImportApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.import'?: IImportDomain;
    config?: Config.IConfig;
}

interface IImportParams {
    file: Promise<IFileUpload>;
    startAt?: number;
}

interface IImportExcelParams {
    file: Promise<IFileUpload>;
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

export default function ({'core.domain.import': importDomain = null, config = null}: IDeps = {}): ICoreImportApp {
    const _getFileExtension = (filename: string): string | null => {
        if (filename.lastIndexOf('.') === -1) {
            return null;
        }

        return filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
    };

    const _validateFileFormat = (filename: string, allowed: string[]) => {
        const fileExtension = _getFileExtension(filename);

        if (!allowed.includes(fileExtension)) {
            throw new ValidationError<IImportParams>({
                file: {
                    msg: Errors.INVALID_FILE_FORMAT,
                    vars: {expected: allowed, received: fileExtension}
                }
            });
        }
    };

    const _storeUploadFile = async (fileData: IFileUpload): Promise<string> => {
        const {createReadStream, filename} = fileData;
        const readStream = createReadStream();
        const storedFileName = `${nanoid()}_${filename}`;
        const storedFilePath = `${config.import.directory}/${storedFileName}`;

        await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(storedFilePath);

            writeStream.on('finish', resolve);

            // If there's an error writing the file, remove the partially written file.
            writeStream.on('error', error => {
                fs.unlink(storedFilePath, () => {
                    reject(error);
                });
            });

            readStream.pipe(writeStream);
        });

        return storedFileName;
    };

    return {
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
                        import(file: Upload!, startAt: Int): ID!
                        importExcel(file: Upload!, sheets: [SheetInput], startAt: Int): ID!
                    }
                `,
                resolvers: {
                    Upload: GraphQLUpload,
                    Mutation: {
                        async import(_, {file, startAt}: IImportParams, ctx: IQueryInfos): Promise<string> {
                            const fileData: IFileUpload = await file;

                            const allowedExtensions = ['json'];
                            _validateFileFormat(fileData.filename, allowedExtensions);

                            // Store JSON file in local filesystem.
                            const storedFileName = await _storeUploadFile(fileData);

                            return importDomain.import(
                                {filename: storedFileName, ctx},
                                {
                                    // Delete remaining import file.
                                    ...(!!startAt && {startAt}),
                                    callback: {
                                        moduleName: 'utils',
                                        name: 'deleteFile',
                                        args: [`${config.import.directory}/${storedFileName}`],
                                        type: [
                                            TaskCallbackType.ON_SUCCESS,
                                            TaskCallbackType.ON_FAILURE,
                                            TaskCallbackType.ON_CANCEL
                                        ]
                                    }
                                }
                            );

                            // FIXME: If import fail should we backup database?
                        },
                        async importExcel(
                            _,
                            {file, sheets, startAt}: IImportExcelParams,
                            ctx: IQueryInfos
                        ): Promise<string> {
                            const fileData: IFileUpload = await file;

                            const allowedExtensions = ['xlsx'];
                            _validateFileFormat(fileData.filename, allowedExtensions);

                            // Store XLSX file in local filesystem.
                            const storedFileName = await _storeUploadFile(fileData);

                            return importDomain.importExcel({filename: storedFileName, sheets, startAt}, ctx);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
