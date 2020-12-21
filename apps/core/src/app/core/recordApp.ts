// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IUtils} from 'utils/utils';
import {IAppGraphQLSchema} from '_types/graphql';
import {IRecord} from '_types/record';
import {PreviewSizes} from '../../_types/filesManager';
import {IGraphqlApp} from '../graphql/graphqlApp';
import {ICoreAttributeApp} from './attributeApp/attributeApp';
import {IIndexationManagerApp} from './indexationManagerApp';

export interface ICoreRecordApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.record'?: IRecordDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.utils'?: IUtils;
    'core.app.graphql'?: IGraphqlApp;
    'core.app.core.attribute'?: ICoreAttributeApp;
    'core.app.core.indexationManager'?: IIndexationManagerApp;
}

export default function ({
    'core.domain.record': recordDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.utils': utils = null,
    'core.app.core.attribute': attributeApp = null,
    'core.app.core.indexationManager': indexationManagerApp = null
}: IDeps = {}): ICoreRecordApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const systemAttributes = ['created_at', 'created_by', 'modified_at', 'modified_by', 'active'];

            const baseSchema = {
                typeDefs: `
                    interface Record {
                        id: ID!,
                        library: Library!,
                        whoAmI: RecordIdentity!
                        property(attribute: ID!): [GenericValue!]
                        ${await Promise.all(
                            systemAttributes.map(async a => {
                                const attrProps = await attributeDomain.getAttributeProperties({
                                    id: a,
                                    ctx: {
                                        userId: '0',
                                        queryId: 'recordAppGenerateBaseSchema'
                                    }
                                });
                                return `${a}: ${await attributeApp.getGraphQLFormat(attrProps)}`;
                            })
                        )}
                    }

                    type RecordIdentity {
                        id: ID!,
                        library: Library!,
                        label: String,
                        color: String,
                        preview: Preview
                    }

                     type Preview {
                        ${Object.keys(PreviewSizes).map(sizeName => `${sizeName}: String,`)}
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

                    input RecordInput {
                        id: ID!
                        library: String!
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

                    type RecordsList {
                        totalCount: Int!,
                        list: [Record!]!
                    }

                    extend type Mutation {
                        createRecord(library: ID): Record!
                        deleteRecord(library: ID, id: ID): Record!
                        indexRecords(libraryId: String!, records: [String!]): Boolean!
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
                            return recordDomain.createRecord(library, ctx);
                        },
                        async deleteRecord(parent, {library, id}, ctx): Promise<IRecord> {
                            return recordDomain.deleteRecord({library, id, ctx});
                        },
                        async indexRecords(parent, {libraryId, records}, ctx): Promise<boolean> {
                            return indexationManagerApp.indexDatabase(ctx, libraryId, records);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
