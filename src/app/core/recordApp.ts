import {IRecordDomain} from 'domain/record/recordDomain';
import {IUtils} from 'utils/utils';
import {IRecord} from '../../_types/record';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';

export interface ICoreRecordApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.record'?: IRecordDomain;
    'core.utils'?: IUtils;
    'core.app.graphql'?: IGraphqlApp;
}

export default function({
    'core.domain.record': recordDomain = null,
    'core.utils': utils = null,
    'core.app.graphql': graphqlApp = null
}: IDeps = {}): ICoreRecordApp {
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

                    # Records support on both offset and cursor. Cannot use both at the same time.
                    # If none is supplied, it will apply an offset 0. Cursors are always returned along the results
                    # ⚠️Sorting is disallowed when using cursor pagination
                    input RecordsPagination {
                        limit: Int!,
                        cursor: String,
                        offset: Int
                    }

                    # Cursors to use for navigation among a record list.
                    # If one a the cursors is null, it means there's nothing more to see in this direction
                    type RecordsListCursor {
                        prev: String,
                        next: String
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
                        async createRecord(parent, {library}, ctx): Promise<IRecord> {
                            const newRec = await recordDomain.createRecord(library, graphqlApp.ctxToQueryInfos(ctx));

                            return newRec;
                        },
                        async deleteRecord(parent, {library, id}, ctx): Promise<IRecord> {
                            return recordDomain.deleteRecord(library, id, graphqlApp.ctxToQueryInfos(ctx));
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
