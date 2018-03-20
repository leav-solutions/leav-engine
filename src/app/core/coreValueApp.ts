import {IAppGraphQLSchema} from '../graphql/graphqlApp';
import {IValueDomain} from 'domain/valueDomain';
import {IValue} from '_types/value';

export interface ICoreLibraryApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(valueDomain: IValueDomain): ICoreLibraryApp {
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

                    input ValueInput {
                        id: ID,
                        value: String
                    }

                    extend type Mutation {
                        saveValue(library: String, recordId: ID, attribute: String, value: ValueInput): Value
                    }
                `,
                resolvers: {
                    Mutation: {
                        async saveValue(parent, {library, recordId, attribute, value}): Promise<IValue> {
                            return valueDomain.saveValue(library, recordId, attribute, value);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
