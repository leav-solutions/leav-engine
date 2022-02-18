// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GraphQLUpload} from 'graphql-upload';
import {IImportDomain} from 'domain/import/importDomain';
import {IAppGraphQLSchema} from '_types/graphql';
import {IElement, IFile, IFileUpload} from '_types/import';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import fs from 'fs';
import {nanoid} from 'nanoid';
import * as Config from '_types/config';

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
    library: string;
    mapping: string[];
    key: string | null;
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

                    extend type Mutation {
                        import(file: Upload!): Boolean!
                        importExcel(file: Upload!, library: String!, mapping: [String]!, key: String): Boolean!
                    }
                `,
                resolvers: {
                    Upload: GraphQLUpload,
                    Mutation: {
                        async import(_, {file}: IImportParams, ctx: IQueryInfos): Promise<boolean> {
                            const fileData: IFileUpload = await file;

                            const allowedExtensions = ['json'];
                            _validateFileFormat(fileData.filename, allowedExtensions);

                            // store JSON file in local filesystem
                            const storedFilename = await _storeUploadFile(fileData);

                            await importDomain.import(storedFilename, ctx);

                            // FIXME: If import file should we backup db?
                            // Delete remaining cache/import files?

                            // TODO: Waiting to link an id to this import to retrieve
                            // the progression and display it on explorer.

                            return true;
                        },
                        async importExcel(
                            _,
                            {file, library, mapping, key}: IImportExcelParams,
                            ctx: IQueryInfos
                        ): Promise<boolean> {
                            const fileData: IFileUpload = await file;

                            const allowedExtensions = ['xlsx'];
                            _validateFileFormat(fileData.filename, allowedExtensions);

                            // store XLSX file in local filesystem
                            const storedFilename = await _storeUploadFile(fileData);

                            await importDomain.importExcel({filename: storedFilename, library, mapping, key}, ctx);

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
