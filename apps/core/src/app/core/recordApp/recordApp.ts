// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IKeyValue, type PublishedEvent} from '@leav/utils';
import {type ConvertVersionFromGqlFormatFunc} from 'app/helpers/convertVersionFromGqlFormat';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type ILibraryDomain} from 'domain/library/libraryDomain';
import {type IPermissionDomain} from 'domain/permission/permissionDomain';
import {type IRecordDomain} from 'domain/record/recordDomain';
import {type ITreeDomain} from 'domain/tree/treeDomain';
import LeavError from '../../../errors/LeavError';
import {type GraphQLResolveInfo, GraphQLScalarType} from 'graphql';
import {withFilter} from 'graphql-subscriptions';
import {type IUtils} from 'utils/utils';
import {type IAppGraphQLSchema} from '_types/graphql';
import {type ICursorPaginationParams, type IListWithCursor, type IPaginationParams} from '_types/list';
import {type IQueryInfos} from '_types/queryInfos';
import {type ITree} from '_types/tree';
import {type IPreview} from '../../../_types/preview';
import ValidationError from '../../../errors/ValidationError';
import {Errors, ErrorTypes} from '../../../_types/errors';
import {TriggerNames} from '../../../_types/eventsManager';
import {type AttributePermissionsActions, PermissionTypes, RecordPermissionsActions} from '../../../_types/permissions';
import {
    AttributeCondition,
    type IRecord,
    type IRecordFilterLight,
    type IRecordIdentity,
    type IRecordUpdateEvent,
    type IRecordUpdateEventFilters,
    TreeCondition
} from '../../../_types/record';
import {type IGraphqlAppModule, type IGraphqlApp} from '../../graphql/graphqlApp';
import {type ICommonSubscriptionFilters, type ICoreSubscriptionsHelpersApp} from '../helpers/subscriptions';
import {type IIndexationManagerApp} from '../indexationManagerApp';
import {type ICreateRecordParams, type IRecordsQueryVariables} from './_types';
import {type IFindRecordParams} from 'domain/record/_types';
import {type IAttributeDomain} from 'domain/attribute/attributeDomain';

export type ICoreRecordApp = IGraphqlAppModule;

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
                        created_at: Int!,
                        created_by: Record!,
                        modified_at: Int!,
                        modified_by: Record!,
                        active: Boolean!,
                        library: Library!,
                        whoAmI: RecordIdentity!,
                        property(attribute: ID!): [GenericValue!]!,
                        properties(attributeIds: [ID!]!): [RecordProperty!]!,
                        permissions: RecordPermissions!
                    }

                    type RecordProperty {
                        attributeId: ID!,
                        attributeProperties: Attribute!,
                        recordAttributePermissions: AttributePermissions!
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
                        createEmptyRecord(library: ID!): CreateRecordResult!
                        activateNewRecord(library: ID!, recordId: ID!, formId: String): CreateRecordResult!
                        createRecord(library: ID!, data: CreateRecordDataInput): CreateRecordResult!
                        deleteRecord(library: ID, id: ID): Record!
                        indexRecords(libraryId: String!, records: [String!]): Boolean!
                        activateRecords(libraryId: String!, recordsIds: [String!], filters: [RecordFilterInput!]): [Record!]!
                        deactivateRecords(libraryId: String!, recordsIds: [String!], filters: [RecordFilterInput!]): [Record!]!
                        purgeInactiveRecords(libraryId: String!): [Record!]!
                        purgeRecord(libraryId: ID!, recordId: ID!): Record!
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
                        async createEmptyRecord(_, {library}: ICreateRecordParams, ctx: IQueryInfos) {
                            const record = await recordDomain.createEmptyRecord({
                                library,
                                ctx
                            });

                            return {
                                record,
                                // TODO : remove valuesErrors after all fronts are updated
                                valuesErrors: null
                            };
                        },
                        async activateNewRecord(_, {library, recordId, formId}, ctx: IQueryInfos) {
                            return recordDomain.activateNewRecord({
                                library,
                                recordId,
                                formId,
                                ctx
                            });
                        },
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

                            return recordDomain.createRecord({
                                library,
                                values: valuesToSave,
                                ctx
                            });
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
                        async activateRecords(parent, {libraryId, recordsIds, filters}, ctx): Promise<IRecord[]> {
                            return recordDomain.activateRecordsBatch({libraryId, recordsIds, filters, ctx});
                        },
                        async deactivateRecords(parent, {libraryId, recordsIds, filters}, ctx): Promise<IRecord[]> {
                            return recordDomain.deactivateRecordsBatch({libraryId, recordsIds, filters, ctx});
                        },
                        async purgeInactiveRecords(parent, {libraryId}, ctx): Promise<IRecord[]> {
                            return recordDomain.purgeInactiveRecords({libraryId, ctx});
                        },
                        async purgeRecord(parent, {libraryId, recordId}, ctx): Promise<IRecord> {
                            return recordDomain.purgeRecord({libraryId, recordId, ctx});
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
                    RecordProperty: {
                        attributeProperties: async (
                            parent: {record: IRecord; attributeId: string},
                            _,
                            ctx: IQueryInfos
                        ) =>
                            attributeDomain.getAttributeProperties({
                                id: parent.attributeId,
                                ctx
                            }),
                        values: async (parent: {record: IRecord; attributeId: string}, _, ctx: IQueryInfos) =>
                            _getPropertyValues(parent.record, parent.attributeId, ctx),
                        recordAttributePermissions: async (
                            parent: {record: IRecord; attributeId: string},
                            _,
                            ctx: IQueryInfos,
                            graphqlInfo: GraphQLResolveInfo
                        ) => {
                            const requestedPermissionsActions =
                                graphqlApp.getQueryFields(graphqlInfo).map(field => field.name) ?? [];

                            return Object.fromEntries(
                                await Promise.all(
                                    requestedPermissionsActions.map(async action => [
                                        action,
                                        await permissionDomain.isAllowed({
                                            type: PermissionTypes.RECORD_ATTRIBUTE,
                                            applyTo: parent.record.library,
                                            action: action as AttributePermissionsActions,
                                            target: {
                                                recordId: parent.record.id,
                                                attributeId: parent.attributeId
                                            },
                                            userId: ctx.userId,
                                            ctx
                                        })
                                    ])
                                )
                            );
                        }
                    },
                    Record: {
                        library: async (record: IRecord, _, ctx: IQueryInfos) =>
                            record.library ? libraryDomain.getLibraryProperties(record.library, ctx) : null,
                        whoAmI: async (rec: IRecord, _, ctx: IQueryInfos) => recordDomain.getRecordIdentity(rec, ctx),
                        property: async (parent: IRecord, {attribute}: {attribute: string}, ctx: IQueryInfos) =>
                            _getPropertyValues(parent, attribute, ctx),
                        properties: (parent: IRecord, {attributeIds}: {attributeIds: string[]}) =>
                            attributeIds.map(attributeId => ({
                                record: parent,
                                attributeId
                            })),
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
                    RecordIdentity: {
                        label: async (recordIdentity: IRecordIdentity): Promise<string> => recordIdentity.getLabel?.(),
                        subLabel: async (recordIdentity: IRecordIdentity): Promise<string | null> =>
                            recordIdentity.getSubLabel?.(),
                        color: async (recordIdentity: IRecordIdentity): Promise<string | null> =>
                            recordIdentity.getColor?.(),
                        preview: async (recordIdentity: IRecordIdentity): Promise<IPreview | null> =>
                            recordIdentity.getPreview?.()
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

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        }
    };
}
