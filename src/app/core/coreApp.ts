import {AwilixContainer} from 'awilix';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';

export interface ICoreApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(
    libraryDomain: ILibraryDomain,
    attributeDomain: IAttributeDomain,
    recordDomain: IRecordDomain,
    valueDomain: IValueDomain,
    depsManager: AwilixContainer,
    graphqlApp: IGraphqlApp,
    config: any
): ICoreApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type SystemTranslation {
                        ${config.lang.available.map(l => `${l}: String`)}
                    }

                    input SystemTranslationInput {
                        ${config.lang.available.map(l => `${l}: String${l === config.lang.default ? '!' : ''}`)}
                    }
                `,
                resolvers: {
                    Query: {} as any,
                    Mutation: {} as any
                }
            };

            if (config.env === 'test') {
                baseSchema.typeDefs += `
                    extend type Mutation {
                        refreshSchema: Boolean
                    }
                `;

                baseSchema.resolvers.Mutation.refreshSchema = async () => {
                    return graphqlApp.generateSchema();
                };
            }

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
