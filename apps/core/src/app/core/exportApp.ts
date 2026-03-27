// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IExportDomain} from '../../domain/export/exportDomain';
import {type IAppGraphQLSchema} from '../../_types/graphql';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';

export type ICoreExportApp = IGraphqlAppModule;

interface IDeps {
    'core.domain.export': IExportDomain;
}

export default function ({'core.domain.export': exportDomain}: IDeps): ICoreExportApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type ExportProfileColumn {
                        columnLabel: String!,
                        attribute: String!
                    }

                    type ExportProfileError {
                        message: String!
                    }

                    type ExportProfile {
                        label: String!,
                        columns: [ExportProfileColumn!]!
                        error: ExportProfileError
                    }

                    type ExportProfiles {
                        defaultProfile: String!,
                        profiles: [ExportProfile!]!
                    }

                    extend type Query {
                        export(library: ID!, filters: [RecordFilterInput], profile: String): String!
                    }
                `,
                resolvers: {
                    Query: {
                        async export(parent, {library, filters, profile}, ctx): Promise<string> {
                            return exportDomain.exportExcel({library, filters, ctx, profile}, {});
                        },
                    },
                },
            };

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        },
    };
}
