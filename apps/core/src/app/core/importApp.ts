// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GraphQLUpload} from 'graphql-upload';
import {IImportDomain} from 'domain/import/importDomain';
import ExcelJS from 'exceljs';
import {IAppGraphQLSchema} from '_types/graphql';
import {IElement, IFile, IFileUpload} from '_types/import';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import JsonParser from 'jsonparse';
import {setTimeout} from 'timers';

export interface ICoreImportApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.import'?: IImportDomain;
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

export default function ({'core.domain.import': importDomain = null}: IDeps = {}): ICoreImportApp {
    const _getFileDataBuffer = async (file: IFileUpload, callback): Promise<boolean> => {
        const {createReadStream} = file;

        const fileStream = createReadStream();

        const p = new JsonParser();

        p.onValue = async function (value) {
            if (this.stack[this.stack.length - 1]?.key === 'elements' && !!value.library) {
                await callback(value);
            }

            if (this.stack[this.stack.length - 1]?.key === 'trees' && !!value.treeId) {
                // TODO:
            }
        };

        return new Promise((resolve, reject) => {
            fileStream.on('data', chunk => {
                setTimeout(() => {
                    p.write(chunk);
                }, 100);
            });
            fileStream.on('error', e => reject(new ValidationError({id: Errors.FILE_ERROR})));
            fileStream.on('end', () => resolve(true));
        });
    };

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

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    scalar Upload

                    extend type Mutation {
                        import(file: Upload!): Boolean!
                        
                    }
                `,
                // importExcel(file: Upload!, library: String!, mapping: [String]!, key: String): Boolean!
                resolvers: {
                    Upload: GraphQLUpload,
                    Mutation: {
                        async import(_, {file}: IImportParams, ctx: IQueryInfos): Promise<boolean> {
                            const fileData: IFileUpload = await file;

                            const allowedExtensions = ['json'];
                            _validateFileFormat(fileData.filename, allowedExtensions);

                            await _getFileDataBuffer(fileData, async (element: any) => {
                                await importDomain.import(element, ctx);
                            });

                            return true;
                        }
                        // async importExcel(
                        //     _,
                        //     {file, library, mapping, key}: IImportExcelParams,
                        //     ctx: IQueryInfos
                        // ): Promise<boolean> {
                        //     const fileData = await file;

                        //     const allowedExtensions = ['xlsx'];
                        //     _validateFileFormat(fileData.filename, allowedExtensions);

                        //     const buffer = await _getFileDataBuffer(fileData);
                        //     const workbook = new ExcelJS.Workbook();

                        //     await workbook.xlsx.load(buffer);
                        //     const data: string[][] = [];

                        //     workbook.eachSheet(s => {
                        //         s.eachRow(r => {
                        //             let elem = (r.values as string[]).slice(1);

                        //             // replace empty item by null
                        //             elem = Array.from(elem, e => (typeof e !== 'undefined' ? e : null));

                        //             data.push(elem);
                        //         });
                        //     });

                        //     return importDomain.importExcel({data, library, mapping, key}, ctx);
                        // }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
