// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IImportDomain} from 'domain/import/importDomain';
import fs from 'fs';
import {GraphQLUpload} from 'graphql-upload';
import {nanoid} from 'nanoid';
import * as Config from '_types/config';
import {IAppGraphQLSchema} from '_types/graphql';
import {IFileUpload, ImportType} from '_types/import';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';

export interface ICoreImportApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.import'?: IImportDomain;
    config?: Config.IConfig;
}

interface IImportParams {
    file: Promise<IFileUpload>;
}

interface IImportExcelParams {
    file: Promise<IFileUpload>;
    sheets?: Array<{
        type: ImportType;
        library: string;
        mapping: Array<string | null>;
        keyIndex?: number;
        linkAttribute?: string;
        keyToIndex?: number;
    } | null>;
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
        const storedFileName = `${nanoid()}-${filename}`;
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
                        STANDARD
                        LINK
                    }

                    input SheetInput {
                        type: ImportType!
                        library: String!,
                        mapping: [String],
                        keyIndex: Int,
                        linkAttribute: String,
                        keyToIndex: Int,
                    }

                    extend type Mutation {
                        import(file: Upload!): Boolean!
                        importExcel(file: Upload!, sheets: [SheetInput]): Boolean!
                    }
                `,
                resolvers: {
                    Upload: GraphQLUpload,
                    Mutation: {
                        async import(_, {file}: IImportParams, ctx: IQueryInfos): Promise<boolean> {
                            const fileData: IFileUpload = await file;

                            const allowedExtensions = ['json'];
                            _validateFileFormat(fileData.filename, allowedExtensions);

                            // Store JSON file in local filesystem.
                            const storedFileName = await _storeUploadFile(fileData);

                            try {
                                await importDomain.import(storedFileName, ctx);
                            } finally {
                                // Delete remaining import file.
                                await fs.promises.unlink(`${config.import.directory}/${storedFileName}`);
                            }

                            // FIXME: If import fail should we backup db?
                            // TODO: Waiting to link an id to this import to retrieve
                            // the progression and display it on explorer.

                            return true;
                        },
                        async importExcel(_, {file, sheets}: IImportExcelParams, ctx: IQueryInfos): Promise<boolean> {
                            const fileData: IFileUpload = await file;

                            const allowedExtensions = ['xlsx'];
                            _validateFileFormat(fileData.filename, allowedExtensions);

                            // Store XLSX file in local filesystem.
                            const storedFileName = await _storeUploadFile(fileData);

                            try {
                                await importDomain.importExcel({filename: storedFileName, sheets}, ctx);
                            } finally {
                                // Delete remaining import file.
                                await fs.promises.unlink(`${config.import.directory}/${storedFileName}`);
                            }

                            return true;
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
