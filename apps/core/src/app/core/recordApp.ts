// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IRecordDomain, IRecordFilterLight} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {GraphQLScalarType} from 'graphql';
import {withFilter} from 'graphql-subscriptions';
import {IUtils} from 'utils/utils';
import {PublishedEvent} from '_types/event';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {ITree} from '_types/tree';
import {TriggerNames} from '../../_types/eventsManager';
import {RecordPermissionsActions} from '../../_types/permissions';
import {
    AttributeCondition,
    IRecord,
    IRecordUpdateEvent,
    IRecordUpdateEventFilters,
    TreeCondition
} from '../../_types/record';
import {IGraphqlApp} from '../graphql/graphqlApp';
import {ICoreAttributeApp} from './attributeApp/attributeApp';
import {ICommonSubscriptionFilters, ICoreSubscriptionsHelpersApp} from './helpers/subscriptions';
import {IIndexationManagerApp} from './indexationManagerApp';

export interface ICoreRecordApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.record'?: IRecordDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.utils'?: IUtils;
    'core.app.graphql'?: IGraphqlApp;
    'core.app.core.attribute'?: ICoreAttributeApp;
    'core.app.core.indexationManager'?: IIndexationManagerApp;
    'core.app.core.subscriptionsHelper'?: ICoreSubscriptionsHelpersApp;
}

export default function ({
    'core.domain.record': recordDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.tree': treeDomain = null,
    'core.domain.eventsManager': eventsManagerDomain = null,
    'core.utils': utils = null,
    'core.app.core.attribute': attributeApp = null,
    'core.app.core.indexationManager': indexationManagerApp = null,
    'core.app.core.subscriptionsHelper': subscriptionsHelper = null
}: IDeps = {}): ICoreRecordApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const systemAttributes = ['created_at', 'created_by', 'modified_at', 'modified_by', 'active'];
            const recordInterfaceDef = `
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
                )},
                permissions: RecordPermissions!
            `;

            const baseSchema = {
                typeDefs: `
                    scalar Preview

                    type RecordPermissions {
                        ${Object.values(RecordPermissionsActions)
                            .map(action => `${action}: Boolean!`)
                            .join(' ')}
                    }

                    interface Record {
                        ${recordInterfaceDef}
                    }

                    interface FileRecord {
                        ${recordInterfaceDef}
                        file_type: FileType!
                    }

                    type RecordIdentity {
                        id: ID!,
                        library: Library!,
                        label: String,
                        subLabel: String,
                        color: String,
                        preview: Preview
                    }

                    type RecordIdentityConf {
                        label: ID,
                        color: ID,
                        preview: ID,
                        treeColorPreview: ID,
                        subLabel: ID
                    }

                    input RecordIdentityConfInput {
                        label: ID,
                        color: ID,
                        preview: ID,
                        treeColorPreview: ID,
                        subLabel: ID
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


                    enum RecordFilterOperator {
                        AND
                        OR
                        OPEN_BRACKET
                        CLOSE_BRACKET
                    }

                    enum RecordFilterCondition {
                        ${Object.values({...AttributeCondition, ...TreeCondition}).join(' ')}
                    }

                    type RecordFilter {
                        field: String,
                        value: String,
                        condition: RecordFilterCondition,
                        operator: RecordFilterOperator,
                        tree: Tree
                    }

                    input RecordFilterInput {
                        field: String,
                        value: String,
                        condition: RecordFilterCondition,
                        operator: RecordFilterOperator,
                        treeId: String
                    }

                    type RecordSort {
                        field: String!,
                        order: SortOrder!
                    }

                    input RecordSortInput {
                        field: String!,
                        order: SortOrder!
                    }

                    type RecordUpdateEvent {
                        record: Record!
                        updatedValues: [RecordUpdatedValues!]!
                    }

                    type RecordUpdatedValues {
                        attribute: String!,
                        value: GenericValue!
                    }

                    input RecordUpdateFilterInput {
                        libraries: [ID!],
                        records: [ID!],
                        ignoreOwnEvents: Boolean
                    }

                    extend type Mutation {
                        createRecord(library: ID): Record!
                        deleteRecord(library: ID, id: ID): Record!
                        indexRecords(libraryId: String!, records: [String!]): Boolean!
                        deactivateRecords(libraryId: String!, recordsIds: [String!], filters: [RecordFilterInput!]): [Record!]!
                        purgeInactiveRecords(libraryId: String!): [Record!]!
                    }

                    extend type Subscription {
                        recordUpdate(filters: RecordUpdateFilterInput): RecordUpdateEvent!
                    }
                `,
                resolvers: {
                    Mutation: {
                        async createRecord(parent, {library}: {library: string}, ctx): Promise<IRecord> {
                            return recordDomain.createRecord(library, ctx);
                        },
                        async deleteRecord(
                            parent,
                            {library, id}: {library: string; id: string},
                            ctx
                        ): Promise<IRecord> {
                            return recordDomain.deleteRecord({library, id, ctx});
                        },
                        async indexRecords(
                            parent,
                            {libraryId, records}: {libraryId: string; records?: string[]},
                            ctx
                        ): Promise<boolean> {
                            await indexationManagerApp.indexDatabase(ctx, libraryId, records);

                            return true;
                        },
                        async deactivateRecords(parent, {libraryId, recordsIds, filters}, ctx): Promise<IRecord[]> {
                            return recordDomain.deactivateRecordsBatch({libraryId, recordsIds, filters, ctx});
                        },
                        async purgeInactiveRecords(parent, {libraryId}, ctx): Promise<IRecord[]> {
                            return recordDomain.purgeInactiveRecords({libraryId, ctx});
                        }
                    },
                    Subscription: {
                        recordUpdate: {
                            subscribe: withFilter(
                                () => eventsManagerDomain.subscribe([TriggerNames.RECORD_UPDATE]),
                                (
                                    event: PublishedEvent<{recordUpdate: IRecordUpdateEvent}>,
                                    {filters}: {filters: ICommonSubscriptionFilters & IRecordUpdateEventFilters},
                                    ctx: IQueryInfos
                                ) => {
                                    if (filters?.ignoreOwnEvents && subscriptionsHelper.isOwnEvent(event, ctx)) {
                                        return false;
                                    }

                                    const {recordUpdate} = event;
                                    let mustReturn = true;
                                    if (filters?.records?.length) {
                                        mustReturn = filters?.records.includes(recordUpdate?.record.id);
                                    }

                                    if (mustReturn && filters?.libraries?.length) {
                                        mustReturn = filters?.libraries.includes(recordUpdate?.record.library);
                                    }

                                    return mustReturn;
                                }
                            )
                        }
                    },
                    Record: {
                        __resolveType(obj) {
                            return utils.libNameToTypeName(obj.library);
                        }
                    },
                    FileRecord: {
                        __resolveType(obj) {
                            return utils.libNameToTypeName(obj.library);
                        }
                    },
                    RecordFilter: {
                        tree: async (recordFilter: IRecordFilterLight, _, ctx: IQueryInfos): Promise<ITree> => {
                            if (!recordFilter.treeId) {
                                return null;
                            }

                            return treeDomain.getTreeProperties(recordFilter.treeId, ctx);
                        }
                    },
                    Preview: new GraphQLScalarType({
                        name: 'Preview',
                        description: 'Object containing all previews available for a record',
                        serialize: val => val,
                        parseValue: val => val,
                        parseLiteral: ast => ast
                    })
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
