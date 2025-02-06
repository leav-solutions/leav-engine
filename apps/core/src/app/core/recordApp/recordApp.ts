// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IKeyValue, PublishedEvent} from '@leav/utils';
import {ConvertVersionFromGqlFormatFunc} from 'app/helpers/convertVersionFromGqlFormat';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import LeavError from '../../../errors/LeavError';
import {GraphQLResolveInfo, GraphQLScalarType} from 'graphql';
import {withFilter} from 'graphql-subscriptions';
import {IUtils} from 'utils/utils';
import {IAppGraphQLSchema} from '_types/graphql';
import {ICursorPaginationParams, IListWithCursor, IPaginationParams} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {ITree} from '_types/tree';
import ValidationError from '../../../errors/ValidationError';
import {Errors, ErrorTypes} from '../../../_types/errors';
import {TriggerNames} from '../../../_types/eventsManager';
import {PermissionTypes, RecordPermissionsActions} from '../../../_types/permissions';
import {
    AttributeCondition,
    IRecord,
    IRecordFilterLight,
    IRecordUpdateEvent,
    IRecordUpdateEventFilters,
    TreeCondition
} from '../../../_types/record';
import {IGraphqlApp} from '../../graphql/graphqlApp';
import {ICommonSubscriptionFilters, ICoreSubscriptionsHelpersApp} from '../helpers/subscriptions';
import {IIndexationManagerApp} from '../indexationManagerApp';
import {ICreateRecordParams, IRecordsQueryVariables} from './_types';
import {IFindRecordParams} from 'domain/record/_types';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';

export interface ICoreRecordApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.record': IRecordDomain;
    'core.domain.tree': ITreeDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.permission': IPermissionDomain;
    'core.domain.library': ILibraryDomain;
    'core.domain.attribute': IAttributeDomain;
    'core.utils': IUtils;
    'core.app.graphql': IGraphqlApp;
    'core.app.core.indexationManager': IIndexationManagerApp;
    'core.app.helpers.convertVersionFromGqlFormat': ConvertVersionFromGqlFormatFunc;
    'core.app.core.subscriptionsHelper': ICoreSubscriptionsHelpersApp;
}

export default function ({
    'core.domain.record': recordDomain,
    'core.domain.tree': treeDomain,
    'core.domain.eventsManager': eventsManagerDomain,
    'core.domain.permission': permissionDomain,
    'core.domain.library': libraryDomain,
    'core.domain.attribute': attributeDomain,
    'core.utils': utils,
    'core.app.graphql': graphqlApp,
    'core.app.core.indexationManager': indexationManagerApp,
    'core.app.helpers.convertVersionFromGqlFormat': convertVersionFromGqlFormat,
    'core.app.core.subscriptionsHelper': subscriptionsHelper
}: IDeps): ICoreRecordApp {
    const _getPropertyValues = async (parent: IRecord, attributeId: string, ctx: IQueryInfos) => {
        try {
            return recordDomain.getRecordFieldValue({
                library: parent.library,
                record: parent,
                attributeId,
                options: {
                    version: ctx.version,
                    forceArray: true
                },
                ctx
            });
        } catch (error) {
            if (error instanceof LeavError) {
                ctx.errors = [...(ctx.errors ?? []), error];
                return [];
            }

            const leavErr = new LeavError(ErrorTypes.INTERNAL_ERROR, error.message, {
                fields: {[attributeId]: error.message},
                record: {
                    id: parent.id,
                    library: parent.library
                }
            });
            ctx.errors = [...(ctx.errors ?? []), leavErr];
            return [];
        }
    };

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    scalar Preview

                    type RecordPermissions {
                        ${Object.values(RecordPermissionsActions)
                            .map(action => `${action}: Boolean!`)
                            .join(' ')}
                    }

                    type Record {
                        id: ID!,
                        library: Library!,
                        whoAmI: RecordIdentity!,
                        property(attribute: ID!): [GenericValue!]!,
                        properties(attributeIds: [ID!]!): [RecordProperty!]!,
                        permissions: RecordPermissions!
                    }

                    type RecordProperty {
                        attributeId: ID!,
                        attributeProperties: Attribute!,
                        values: [GenericValue!]!
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
                        totalCount: Int,
                        cursor: RecordsListCursor,
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

                    input CreateRecordDataInput {
                        version: [ValueVersionInput!],
                        values: [ValueBatchInput!]
                    }

                    type CreateRecordResult {
                        record: Record,
                        valuesErrors: [ValueBatchError!]
                    }

                    extend type Query {
                        records(
                            library: ID!,
                            filters: [RecordFilterInput],
                            sort: RecordSortInput @deprecated(reason: "Should use multipleSort. They are both here for backward compatibility. Eventually, multipleSort will replace sort."),
                            multipleSort: [RecordSortInput!]
                            version: [ValueVersionInput],
                            pagination: RecordsPagination,
                            retrieveInactive: Boolean,
                            searchQuery: String
                        ): RecordsList!
                    }

                    extend type Mutation {
                        createRecord(library: ID!, data: CreateRecordDataInput): CreateRecordResult!
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
                    Query: {
                        async records(
                            _,
                            {
                                library,
                                filters,
                                sort,
                                multipleSort,
                                version,
                                pagination,
                                retrieveInactive = false,
                                searchQuery
                            }: IRecordsQueryVariables,
                            ctx: IQueryInfos,
                            info: GraphQLResolveInfo
                        ): Promise<IListWithCursor<IRecord>> {
                            const fields = graphqlApp.getQueryFields(info).map(f => f.name);
                            if (
                                pagination &&
                                typeof pagination.offset !== 'undefined' &&
                                typeof pagination.cursor !== 'undefined'
                            ) {
                                throw new ValidationError({pagination: Errors.PAGINATION_OFFSET_AND_CURSOR});
                            }

                            const formattedVersion =
                                Array.isArray(version) && version.length
                                    ? version.reduce((allVers, vers) => {
                                          allVers[vers.treeId] = vers.treeNodeId;
                                          return allVers;
                                      }, {})
                                    : null;

                            const params: IFindRecordParams = {
                                library,
                                filters,
                                sort: multipleSort ?? [sort],
                                pagination: pagination?.cursor
                                    ? (pagination as ICursorPaginationParams)
                                    : (pagination as IPaginationParams),
                                withCount: fields.includes('totalCount'),
                                retrieveInactive,
                                fulltextSearch: searchQuery
                            };

                            if (formattedVersion) {
                                params.options = {version: formattedVersion};
                                ctx.version = formattedVersion;
                            }

                            return recordDomain.find({
                                params,
                                ctx
                            });
                        }
                    },
                    Mutation: {
                        async createRecord(_, {library, data}: ICreateRecordParams, ctx: IQueryInfos) {
                            const valuesVersion = data?.version ? convertVersionFromGqlFormat(data.version) : null;
                            const valuesToSave = data
                                ? data.values.map(value => ({
                                      ...value,
                                      payload: value.payload ?? value.value,
                                      version: valuesVersion,
                                      metadata: utils.nameValArrayToObj(value.metadata)
                                  }))
                                : null;

                            return recordDomain.createRecord({library, values: valuesToSave, ctx});
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
                            {libraryId, records}: {libraryId: string; records: string[]},
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
                        library: async (record: IRecord, _, ctx: IQueryInfos) =>
                            record.library ? libraryDomain.getLibraryProperties(record.library, ctx) : null,
                        whoAmI: async (rec: IRecord, _, ctx: IQueryInfos) => recordDomain.getRecordIdentity(rec, ctx),
                        property: async (parent: IRecord, {attribute}: {attribute: string}, ctx: IQueryInfos) =>
                            _getPropertyValues(parent, attribute, ctx),
                        properties: async (
                            parent: IRecord,
                            {attributeIds}: {attributeIds: string[]},
                            ctx: IQueryInfos
                        ) =>
                            Promise.all(
                                attributeIds.map(async attributeId => ({
                                    attributeId,
                                    attributeProperties: await attributeDomain.getAttributeProperties({
                                        id: attributeId,
                                        ctx
                                    }),
                                    values: await _getPropertyValues(parent, attributeId, ctx)
                                }))
                            ),
                        permissions: (
                            record: IRecord,
                            _,
                            ctx: IQueryInfos,
                            infos: GraphQLResolveInfo
                        ): Promise<IKeyValue<boolean>> => {
                            const requestedActions = graphqlApp.getQueryFields(infos).map(field => field.name);

                            return requestedActions.reduce(async (allPermsProm, action) => {
                                const allPerms = await allPermsProm;

                                const isAllowed = await permissionDomain.isAllowed({
                                    type: PermissionTypes.RECORD,
                                    applyTo: record.library,
                                    action: action as RecordPermissionsActions,
                                    userId: ctx.userId,
                                    target: {
                                        recordId: record.id
                                    },
                                    ctx
                                });

                                return {...allPerms, [action]: isAllowed};
                            }, Promise.resolve({}));
                        }
                    },
                    RecordFilter: {
                        tree: async (recordFilter: IRecordFilterLight, _, ctx: IQueryInfos): Promise<ITree | null> => {
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
