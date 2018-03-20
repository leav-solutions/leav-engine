import {IAppGraphQLSchema} from '../graphql/graphqlApp';
import {IRecord} from '_types/record';
import {IRecordDomain} from 'domain/recordDomain';

export interface ICoreRecordApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(recordDomain: IRecordDomain): ICoreRecordApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    interface Record {
                        id: ID,
                        created_at: Int,
                        modified_at: Int
                    }

                    extend type Mutation {
                        createRecord(library: LibraryId): Record
                        deleteRecord(library: LibraryId, id: ID): Record
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
