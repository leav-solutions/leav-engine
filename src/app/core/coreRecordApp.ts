import {IAppGraphQLSchema} from '../graphql/graphqlApp';
import {IRecord} from '_types/record';
import {IRecordDomain} from 'domain/recordDomain';

export interface ICoreLibraryApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(recordDomain: IRecordDomain): ICoreLibraryApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type Record {
                        id: ID,
                        created_at: Int,
                        modified_at: Int
                    }

                    extend type Mutation {
                        createRecord(library: String): Record
                        deleteRecord(library: String, id: ID): Record
                    }

                `,
                resolvers: {
                    Mutation: {
                        async createRecord(parent, {library}): Promise<IRecord> {
                            const newRec = await recordDomain.createRecord(library);

                            return newRec;
                        },
                        async deleteRecord(parent, {library, id}): Promise<IRecord> {
                            return recordDomain.deleteRecord(library, id);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
