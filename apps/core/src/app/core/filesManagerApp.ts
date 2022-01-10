// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import filesManagerDomain, {IFilesManagerDomain} from 'domain/filesManager/filesManagerDomain';
import {IAppGraphQLSchema} from '_types/graphql';

export interface IFilesManagerApp {
    init(): Promise<void>;
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.filesManager'?: IFilesManagerDomain;
}

export default function ({'core.domain.filesManager': filesManager}: IDeps): IFilesManagerApp {
    return {
        init: async () => filesManager.init(),
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    extend type Mutation {
                        forcePreviewsGeneration(libraryId: ID!, recordId: ID, failedOnly: Boolean): Boolean!
                    }
                `,

                resolvers: {
                    Mutation: {
                        async forcePreviewsGeneration(
                            parent,
                            {libraryId, recordId, failedOnly},
                            ctx
                        ): Promise<boolean> {
                            return filesManager.forcePreviewsGeneration({ctx, libraryId, recordId, failedOnly});
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
