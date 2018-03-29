import {IAppGraphQLSchema} from '../graphql/graphqlApp';
import {IRecord} from '_types/record';
import {IRecordDomain} from 'domain/recordDomain';
import {IUtils} from 'utils/utils';

export interface ICoreRecordApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(recordDomain: IRecordDomain, utils: IUtils): ICoreRecordApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    interface Record {
                        id: ID,
                        created_at: Value,
                        modified_at: Value
                    }

                    extend type Mutation {
                        createRecord(library: LibraryId): Record
                        deleteRecord(library: LibraryId, id: ID): Record
                    }

                `,
                resolvers: {
                    Record: {
                        __resolveType(obj) {
                            return utils.libNameToTypeName(obj.library);
                        }
                    },
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
