// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAppGraphQLSchema} from '_types/graphql';
import {IFile} from '_types/import';
import {Errors} from '../../_types/errors';
import {IImportDomain} from 'domain/import/importDomain';
import {GraphQLUpload} from 'apollo-server';
import ValidationError from '../../errors/ValidationError';
import ExcelJS from 'exceljs';
import {ReadStream} from 'fs';

export interface ICoreImportApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export type FileUpload = Promise<{
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => ReadStream;
}>;

interface IDeps {
    'core.domain.import'?: IImportDomain;
}

export default function ({'core.domain.import': importDomain = null}: IDeps = {}): ICoreImportApp {
    const _getFileDataBuffer = async (file: FileUpload): Promise<Buffer> => {
        const {createReadStream} = await file;
        const fileStream = createReadStream();

        const data = await ((): Promise<Buffer> =>
            new Promise((resolve, reject) => {
                const chunks = [];

                fileStream.on('data', chunk => chunks.push(chunk));
                fileStream.on('error', e => reject(new ValidationError({id: Errors.FILE_ERROR})));
                fileStream.on('end', () => resolve(Buffer.concat(chunks)));
            }))();

        return data;
    };

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    scalar Upload

                    extend type Mutation {
                        import(file: Upload!): Boolean!
                        importExcel(file: Upload!, library: String!, mapping: [String!]!, key: String): Boolean!
                    }
                `,
                resolvers: {
                    Upload: GraphQLUpload,
                    Mutation: {
                        async import(parent, {file}: {file: FileUpload}, ctx): Promise<boolean> {
                            const buffer = await _getFileDataBuffer(file);
                            const data = JSON.parse(buffer.toString('utf8'));

                            return importDomain.import(data as IFile, ctx);
                        },
                        async importExcel(
                            parent,
                            {
                                file,
                                library,
                                mapping,
                                key
                            }: {file: FileUpload; library: string; mapping: string[]; key: string | null},
                            ctx
                        ): Promise<boolean> {
                            const buffer = await _getFileDataBuffer(file);
                            const workbook = new ExcelJS.Workbook();

                            await workbook.xlsx.load(buffer);
                            const data: string[][] = [];

                            workbook.eachSheet(s => {
                                s.eachRow(r => data.push((r.values as string[]).slice(1)));
                            });

                            return importDomain.importExcel({data, library, mapping, key}, ctx);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
