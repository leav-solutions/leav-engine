// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAppGraphQLSchema} from '_types/graphql';
import {IExportDomain} from 'domain/export/exportDomain';
import {GraphQLUpload} from 'apollo-server';

export interface ICoreExportApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.export'?: IExportDomain;
}

export default function ({'core.domain.export': exportDomain = null}: IDeps = {}): ICoreExportApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    extend type Query {
                        export(library: ID!,  attributes: [ID!], filters: [RecordFilterInput]): Boolean!
                    }
                `,
                resolvers: {
                    Upload: GraphQLUpload,
                    Query: {
                        async export(parent, {library, attributes, filters}, ctx): Promise<boolean> {
                            return exportDomain.export({library, attributes, filters}, ctx);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
