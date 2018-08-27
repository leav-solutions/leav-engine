import {IValueDomain} from 'domain/value/valueDomain';
import {IValue} from '_types/value';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';

export interface ICoreValueApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(valueDomain: IValueDomain, graphqlApp: IGraphqlApp): ICoreValueApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type Value {
                        id_value: ID!,
                        value: String!,
                        raw_value: String!,
                        modified_at: Int!,
                        created_at: Int!
                    }

                    type linkValue {
                        id_value: ID!,
                        value: Record!,
                        modified_at: Int!,
                        created_at: Int!
                    }

                    type treeValue {
                        id_value: ID!,
                        modified_at: Int!,
                        created_at: Int!
                        value: TreeNode!
                    }

                    input ValueInput {
                        id_value: ID,
                        value: String!
                    }

                    extend type Mutation {
                        saveValue(library: ID, recordId: ID, attribute: ID, value: ValueInput): Value!
                        deleteValue(library: ID, recordId: ID, attribute: ID, value: ValueInput): Value!
                    }
                `,
                resolvers: {
                    Mutation: {
                        async saveValue(parent, {library, recordId, attribute, value}, ctx): Promise<IValue> {
                            return valueDomain.saveValue(
                                library,
                                recordId,
                                attribute,
                                value,
                                graphqlApp.ctxToQueryInfos(ctx)
                            );
                        },
                        async deleteValue(parent, {library, recordId, attribute, value}, ctx): Promise<IValue> {
                            return valueDomain.deleteValue(
                                library,
                                recordId,
                                attribute,
                                value,
                                graphqlApp.ctxToQueryInfos(ctx)
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
