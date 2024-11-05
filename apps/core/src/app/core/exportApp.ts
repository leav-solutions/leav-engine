// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IExportDomain} from 'domain/export/exportDomain';
import {IAppGraphQLSchema} from '_types/graphql';

export interface ICoreExportApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.export': IExportDomain;
}

export default function ({'core.domain.export': exportDomain}: IDeps): ICoreExportApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    extend type Query {
                        export(library: ID!,  attributes: [ID!], filters: [RecordFilterInput], startAt: Int): String!
                    }
                `,
                resolvers: {
                    Query: {
                        async export(parent, {library, attributes, filters, startAt}, ctx): Promise<string> {
                            return exportDomain.exportExcel(
                                {library, attributes, filters, ctx},
                                {
                                    ...(!!startAt && {startAt})
                                }
                            );
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
