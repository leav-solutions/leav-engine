import {IAppGraphQLSchema} from '../graphql/graphqlApp';
import {IValueDomain} from 'domain/valueDomain';
import {IValue} from '_types/value';

export interface ICoreValueApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(valueDomain: IValueDomain): ICoreValueApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type Value {
                        id: ID,
                        value: String,
                        modified_at: Int,
                        created_at: Int
                    }

                    type linkValue {
                        id: ID,
                        value: Record,
                        modified_at: Int,
                        created_at: Int
                    }

                    input ValueInput {
                        id: ID,
                        value: String
                    }

                    extend type Mutation {
                        saveValue(library: ID, recordId: ID, attribute: ID, value: ValueInput): Value
                        deleteValue(library: ID, recordId: ID, attribute: ID, value: ValueInput): Value
                    }
                `,
                resolvers: {
                    Mutation: {
                        async saveValue(parent, {library, recordId, attribute, value}): Promise<IValue> {
                            return valueDomain.saveValue(library, recordId, attribute, value);
                        },
                        async deleteValue(parent, {library, recordId, attribute, value}): Promise<IValue> {
                            return valueDomain.deleteValue(library, recordId, attribute, value);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
