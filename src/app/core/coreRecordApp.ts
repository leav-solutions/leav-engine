import {IRecordDomain} from 'domain/record/recordDomain';
import {IUtils} from 'utils/utils';
import {IRecord} from '../../_types/record';
import {IAppGraphQLSchema} from '../graphql/graphqlApp';

export interface ICoreRecordApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(recordDomain: IRecordDomain, utils: IUtils): ICoreRecordApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    interface Record {
                        id: ID!,
                        library: Library!,
                        created_at: Value,
                        modified_at: Value,
                        whoAmI: RecordIdentity!
                    }

                    type RecordIdentity {
                        id: ID!,
                        library: Library!,
                        label: String,
                        color: String,
                        preview: String
                    }

                    type RecordIdentityConf {
                        label: ID,
                        color: ID,
                        preview: ID
                    }

                    input RecordIdentityConfInput {
                        label: ID,
                        color: ID,
                        preview: ID
                    }

                    extend type Mutation {
                        createRecord(library: ID): Record!
                        deleteRecord(library: ID, id: ID): Record!
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
                        async deleteRecord(parent, {library, id}, ctx): Promise<IRecord> {
                            return recordDomain.deleteRecord(library, id, {userId: ctx.auth.userId});
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
