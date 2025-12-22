// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type PublishedEvent} from '@leav/utils';
import {type IAttributeDomain} from 'domain/attribute/attributeDomain';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type ILibraryDomain} from 'domain/library/libraryDomain';
import {type IPermissionDomain} from 'domain/permission/permissionDomain';
import {type GraphQLResolveInfo, GraphQLScalarType} from 'graphql';
import {withFilter} from 'graphql-subscriptions';
import {omit} from 'lodash';
import {type IAppGraphQLSchema} from '_types/graphql';
import {type IList, type IPaginationParams} from '_types/list';
import {type IQueryInfos} from '_types/queryInfos';
import {type IKeyValue} from '_types/shared';
import {type ITreeDomain} from '../../../domain/tree/treeDomain';
import {TriggerNames} from '../../../_types/eventsManager';
import {
    AttributeDependentValuesPermissionsActions,
    PermissionTypes,
    RecordPermissionsActions,
    TreeNodePermissionsActions,
    TreePermissionsActions,
} from '../../../_types/permissions';
import {type IQueryField, type IRecord} from '../../../_types/record';
import {
    type ITree,
    type ITreeEvent,
    type ITreeNode,
    type ITreeNodeWithTreeId,
    TreeBehavior,
    TreeEventTypes,
    type TreePath,
} from '../../../_types/tree';
import {type IGraphqlAppModule, type IGraphqlApp} from '../../graphql/graphqlApp';
import {type ICoreApp} from '../coreApp';
import {type ICommonSubscriptionFilters, type ICoreSubscriptionsHelpersApp} from '../helpers/subscriptions';
import {
    type IAddElementMutationArgs,
    type IDeleteElementMutationArgs,
    type IMoveElementMutationArgs,
    type ISaveTreeMutationArgs,
    type ITreeEventFilters,
    type ITreeLibraryForGraphQL,
    type ITreePermissionsConfForGraphQL,
    type ITreesQueryArgs,
} from './_types';
import {type IRecordPermissionDomain} from '../../../domain/permission/recordPermissionDomain';
import {type IAttributeDependentValuesPermissionDomain} from 'domain/permission/attributeDependentValuesPermissionDomain';

export type ITreeAttributeApp = IGraphqlAppModule;

interface IDeps {
    'core.domain.tree': ITreeDomain;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.permission': IPermissionDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.app.graphql': IGraphqlApp;
    'core.app.core': ICoreApp;
    'core.app.core.subscriptionsHelper': ICoreSubscriptionsHelpersApp;
    'core.domain.library': ILibraryDomain;
    'core.domain.permission.record': IRecordPermissionDomain;
    'core.domain.permission.attributeDependentValues': IAttributeDependentValuesPermissionDomain;
}

export default function ({
    'core.domain.tree': treeDomain,
    'core.domain.attribute': attributeDomain,
    'core.domain.permission': permissionDomain,
    'core.domain.eventsManager': eventsManagerDomain,
    'core.app.core': coreApp,
    'core.app.graphql': graphqlApp,
    'core.app.core.subscriptionsHelper': subscriptionsHelper,
    'core.domain.library': libraryDomain,
    'core.domain.permission.record': recordPermissionDomain,
    'core.domain.permission.attributeDependentValues': attributeDependentValuesPermissionDomain,
}: IDeps): ITreeAttributeApp {
    /**
     * Retrieve parent tree attribute by recursively getting up on GraphQL query path.
     * We consider that the attribute is the first key that it's not one of our tree queries keys (ancestors, children,
     * value) and not a number (which is an array index)
     *
     * @param path
     * @return string
     */
    const _findParentAttribute = (path): string | null => {
        const restrictedKeys = ['record', 'ancestors', 'children', 'value', 'treeValue'];
        if (!restrictedKeys.includes(path.key) && typeof path.key !== 'number') {
            return path.key;
        }

        return path.prev !== null ? _findParentAttribute(path.prev) : null;
    };

    /**
     * Extract tree ID from parent by retrieving attribute, then tree linked to this attribute
     *
     * @param parent
     * @param info
     * @param ctx
     */
    const _extractTreeIdFromParent = async (parent, info, ctx): Promise<string> => {
        const attribute = parent.attribute ?? _findParentAttribute(info.path);
        const attributeProps = await attributeDomain.getAttributeProperties({id: attribute, ctx});
        return attributeProps.linked_tree;
    };

    const _filterTreeContentReduce =
        (ctx: IQueryInfos, treeId: string) =>
        async (
            visibleNodesProm: Promise<ITreeNodeWithTreeId[]>,
            treeNode: ITreeNode,
        ): Promise<ITreeNodeWithTreeId[]> => {
            const visibleNodes = await visibleNodesProm;
            const isVisible = await permissionDomain.isAllowed({
                type: PermissionTypes.TREE_NODE,
                applyTo: treeId,
                action: TreeNodePermissionsActions.ACCESS_TREE,
                target: {nodeId: treeNode.id},
                ctx,
            });

            if (isVisible) {
                visibleNodes.push({...treeNode, treeId});
            }

            return visibleNodes;
        };

    const _getChildrenDepth = (fields: IQueryField[], depth): number => {
        const children = fields.find(f => f.name === 'children');
        if (children) {
            return _getChildrenDepth(children.fields, depth + 1);
        }

        return depth;
    };

    const _getAncestors = async (
        parent: ITreeNode & {treeId?: string},
        _,
        ctx: IQueryInfos,
        info: GraphQLResolveInfo,
    ): Promise<TreePath> => {
        const treeId = parent.treeId ?? ctx.treeId ?? (await _extractTreeIdFromParent(parent, info, ctx));

        const ancestors = await treeDomain.getElementAncestors({treeId, nodeId: parent.id, ctx});

        // Add treeId as it might be useful for nested resolvers
        return ancestors.map(n => ({...n, treeId}));
    };

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    scalar FullTreeContent

                    enum TreeBehavior {
                        ${Object.values(TreeBehavior).join(' ')}
                    }

                    type TreeLibrarySettings {
                        allowMultiplePositions: Boolean!
                        allowedChildren: [String!]!
                        allowedAtRoot: Boolean!
                    }

                    type TreeLibrary {
                        library: Library!,
                        settings: TreeLibrarySettings!
                    }

                    type TreePermissions {
                        ${Object.values(TreePermissionsActions)
                            .map(action => `${action}: Boolean!`)
                            .join(' ')}
                    }

                    type TreeNodePermissions {
                        ${Object.values(TreeNodePermissionsActions)
                            .map(action => `${action}: Boolean!`)
                            .join(' ')}
                    }

                    type Tree {
                        id: ID!,
                        system: Boolean!,
                        libraries: [TreeLibrary!]!,
                        behavior: TreeBehavior!,
                        label(lang: [AvailableLanguage!]): SystemTranslation,
                        permissions_conf: [TreeNodePermissionsConf!],
                        permissions: TreePermissions!,
                        defaultElement: TreeNode,
                        settings: JSONObject
                    }

                    type TreeNodePermissionsConf {
                        libraryId: ID!,
                        permissionsConf: Treepermissions_conf!
                    }

                    input TreeLibrarySettingsInput {
                        allowMultiplePositions: Boolean!
                        allowedChildren: [String!]!
                        allowedAtRoot: Boolean!
                    }

                    input TreeLibraryInput {
                        library: ID!,
                        settings: TreeLibrarySettingsInput!
                    }

                    input TreeInput {
                        id: ID!
                        libraries: [TreeLibraryInput!],
                        behavior: TreeBehavior,
                        label: SystemTranslation,
                        permissions_conf: [TreeNodePermissionsConfInput!],
                        settings: JSONObject
                    }

                    input TreeNodePermissionsConfInput {
                        libraryId: ID!,
                        permissionsConf: Treepermissions_confInput!
                    }

                    type TreeElement {
                        id: ID,
                        library: String
                    }

                    type TreeNode {
                        id: ID!,
                        order: Int,
                        childrenCount: Int,
                        record: Record!,
                        ancestors: [TreeNode!],
                        children: [TreeNode!],
                        linkedRecords(attribute: ID): [Record!],
                        permissions: TreeNodePermissions!
                    }

                    type TreeNodeLight {
                        id: ID!,
                        order: Int,
                        childrenCount: Int,
                        ancestors: [TreeNode!],
                        record: Record!,
                        linkedRecords(attribute: ID): [Record!],
                        permissions: TreeNodePermissions!
                        accessRecordByDefaultPermission: Boolean
                    }

                    type TreeNodeLightList {
                        totalCount: Int,
                        list: [TreeNodeLight!]!
                    }

                    input TreeElementInput {
                        id: ID!,
                        library: String!
                    }

                    input TreesFiltersInput {
                        id: [ID!],
                        label: [String!],
                        system: Boolean,
                        behavior: TreeBehavior,
                        library: String
                    }

                    type TreesList {
                        totalCount: Int!,
                        list: [Tree!]!
                    }

                    enum TreesSortableFields {
                        id
                        system
                        behavior
                    }

                    input SortTrees {
                        field: TreesSortableFields!
                        order: SortOrder
                    }

                    enum TreeEventTypes {
                        ${Object.values(TreeEventTypes).join(' ')}
                    }

                    type TreeEvent {
                        type: TreeEventTypes!,
                        treeId: ID!,
                        element: TreeNode!,
                        parentNode: TreeNode,
                        parentNodeBefore: TreeNode,
                    }

                    input TreeEventFiltersInput {
                        ${subscriptionsHelper.commonSubscriptionsFilters}

                        treeId: ID!,
                        # Nodes concerned by the event, whether be the source or the target
                        nodes: [ID],
                        events: [TreeEventTypes!]
                    }

                    input ChildrenAsRecordValuePermissionFilterInput {
                        libraryId: ID!,
                        attributeId: ID!,
                        action: RecordPermissionsActions!
                    }

                    input AccessRecordByDefaultPermissionInput {
                        libraryId: ID!,
                        attributeId: ID!,
                    }

                    input DependentValuesPermissionFilterInput {
                        libraryId: ID!,
                        recordId: ID!
                        attributeId: ID!,
                    }

                    extend type Query {
                        trees(
                            filters: TreesFiltersInput,
                            pagination: Pagination,
                            sort: SortTrees
                        ): TreesList

                        # Retrieve tree content.
                        # If startAt is specified, it returns this element's children. Otherwise, it starts
                        # from tree root
                        treeContent(treeId: ID!, startAt: ID): [TreeNode!]!

                        # Retrieve direct children of a node. If node is not specified, retrieves root children
                        # childrenAsRecordValuePermissionFilter is used to filter children by record permission if setted as value of a tree attribute
                        treeNodeChildren(
                            treeId: ID!,
                            node: ID,
                            pagination: Pagination,
                            childrenAsRecordValuePermissionFilter: ChildrenAsRecordValuePermissionFilterInput,
                            accessRecordByDefaultPermission: AccessRecordByDefaultPermissionInput,
                            dependentValuesPermissionFilter: DependentValuesPermissionFilterInput
                        ): TreeNodeLightList!

                        # Retrieve full tree content form tree root, as an object.
                        fullTreeContent(treeId: ID!): FullTreeContent

                        # Retrieve record by node id
                        getRecordByNodeId(treeId: ID!, nodeId: ID!): Record!
                    }

                    extend type Mutation {
                        saveTree(tree: TreeInput!): Tree!
                        deleteTree(id: ID!): Tree!
                        treeAddElement(
                            treeId: ID!,
                            element: TreeElementInput!,
                            parent: ID,
                            order: Int
                        ): TreeNode!
                        treeMoveElement(
                            treeId: ID!,
                            nodeId: ID!,
                            parentTo: ID,
                            order: Int
                        ): TreeNode!
                        treeDeleteElement(
                            treeId: ID!,
                            nodeId: ID!,
                            deleteChildren: Boolean
                        ): ID!
                    }

                    extend type Subscription {
                        treeEvent(filters: TreeEventFiltersInput): TreeEvent!
                    }
                `,
                resolvers: {
                    Query: {
                        async trees(
                            _,
                            {filters, pagination, sort}: ITreesQueryArgs,
                            ctx: IQueryInfos,
                        ): Promise<IList<ITree>> {
                            return treeDomain.getTrees({params: {filters, withCount: true, pagination, sort}, ctx});
                        },
                        async getRecordByNodeId(
                            _,
                            {treeId, nodeId}: {treeId: string; nodeId: string},
                            ctx: IQueryInfos,
                        ): Promise<IRecord> {
                            return treeDomain.getRecordByNodeId({treeId, nodeId, ctx});
                        },
                        async treeContent(
                            _,
                            {treeId, startAt}: {treeId: string; startAt: string},
                            ctx: IQueryInfos,
                            info: GraphQLResolveInfo,
                        ): Promise<ITreeNode[]> {
                            ctx.treeId = treeId;

                            const fields = graphqlApp.getQueryFields(info);
                            const hasChildrenCount = !!fields.find(f => f.name === 'childrenCount');
                            const depth = _getChildrenDepth(fields, 1);

                            return (
                                await treeDomain.getTreeContent({
                                    treeId,
                                    startingNode: startAt,
                                    depth,
                                    childrenCount: hasChildrenCount,
                                    ctx,
                                })
                            ).map(node => ({
                                ...node,
                                treeId,
                            }));
                        },
                        async treeNodeChildren(
                            _,
                            {
                                treeId,
                                node,
                                pagination,
                                childrenAsRecordValuePermissionFilter,
                                accessRecordByDefaultPermission,
                                dependentValuesPermissionFilter,
                            }: {
                                treeId: string;
                                node?: string;
                                pagination?: IPaginationParams;
                                childrenAsRecordValuePermissionFilter?: {
                                    libraryId: string;
                                    attributeId: string;
                                    action: RecordPermissionsActions;
                                };
                                accessRecordByDefaultPermission?: {
                                    libraryId: string;
                                    attributeId: string;
                                };
                                dependentValuesPermissionFilter?: {
                                    libraryId: string;
                                    recordId: string;
                                    attributeId: string;
                                };
                            },
                            ctx: IQueryInfos,
                            info: GraphQLResolveInfo,
                        ): Promise<IList<ITreeNode>> {
                            ctx.treeId = treeId;

                            const fields = graphqlApp.getQueryFields(info);
                            const hasChildrenCount = !!fields
                                .find(f => f.name === 'list')
                                ?.fields?.find(f => f.name === 'childrenCount');
                            const withTotalCount = !!fields.find(f => f.name === 'totalCount');

                            const children = await treeDomain.getElementChildren({
                                treeId,
                                nodeId: node,
                                childrenCount: hasChildrenCount,
                                withTotalCount,
                                pagination,
                                ctx,
                            });

                            if (childrenAsRecordValuePermissionFilter) {
                                const permissionsFilter = await Promise.all(
                                    children.list.map(treeNode =>
                                        recordPermissionDomain.evaluateTreeValueRecordPermission({
                                            action: childrenAsRecordValuePermissionFilter.action,
                                            libraryId: childrenAsRecordValuePermissionFilter.libraryId,
                                            attributeId: childrenAsRecordValuePermissionFilter.attributeId,
                                            nodeId: treeNode.id,
                                            ctx,
                                        }),
                                    ),
                                );

                                // Apply permissions filter to children list
                                children.list = children.list.filter((_treeNode, i) => permissionsFilter[i]);
                                // FIXME : should be the total totalCount regarding permissions https://aristid.atlassian.net/browse/LEAVC-323
                                // children.totalCount = children.list.length;
                            }

                            if (dependentValuesPermissionFilter) {
                                const permissionsFilter = await Promise.all(
                                    children.list.map(treeNode =>
                                        attributeDependentValuesPermissionDomain.getAttributeDependentValuesPermission({
                                            action: AttributeDependentValuesPermissionsActions.SET_VALUE,
                                            attributeId: dependentValuesPermissionFilter.attributeId,
                                            recordLibrary: dependentValuesPermissionFilter.libraryId,
                                            recordId: dependentValuesPermissionFilter.recordId,
                                            valueNodeId: treeNode.id,
                                            ctx,
                                        }),
                                    ),
                                );

                                children.list = children.list.filter((_treeNode, i) => permissionsFilter[i]);
                            }

                            return {
                                ...children,
                                list: children.list.map(child => ({...child, treeId, accessRecordByDefaultPermission})),
                            };
                        },
                        async fullTreeContent(_, {treeId}: {treeId: string}, ctx): Promise<ITreeNode[]> {
                            return treeDomain.getTreeContent({treeId, ctx});
                        },
                    },
                    Mutation: {
                        async saveTree(_, {tree}: ISaveTreeMutationArgs, ctx: IQueryInfos): Promise<ITree> {
                            // Convert permissions conf
                            const treeToSave: Partial<ITree> = {
                                ...omit(tree, ['libraries', 'permissions_conf']),
                            };

                            if (tree.permissions_conf) {
                                treeToSave.permissions_conf = tree.permissions_conf.reduce(
                                    (acc, cur) => ({
                                        ...acc,
                                        [cur.libraryId]: cur.permissionsConf,
                                    }),
                                    {},
                                );
                            }

                            if (tree.libraries) {
                                treeToSave.libraries = tree.libraries.reduce(
                                    (acc, cur) => ({...acc, [cur.library]: cur.settings}),
                                    {},
                                );
                            }

                            return treeDomain.saveTree(treeToSave as ITree, ctx);
                        },
                        async deleteTree(parent, {id}, ctx): Promise<ITree> {
                            return treeDomain.deleteTree(id, ctx);
                        },
                        async treeAddElement(
                            _,
                            {treeId, element, parent, order}: IAddElementMutationArgs,
                            ctx,
                        ): Promise<ITreeNodeWithTreeId> {
                            parent = parent || null;

                            const addedNode = await treeDomain.addElement({treeId, element, parent, order, ctx});

                            return {...addedNode, treeId};
                        },
                        async treeMoveElement(
                            _,
                            {treeId, nodeId, parentTo, order}: IMoveElementMutationArgs,
                            ctx,
                        ): Promise<ITreeNodeWithTreeId> {
                            parentTo = parentTo || null;
                            const movedNode = await treeDomain.moveElement({
                                treeId,
                                nodeId,
                                parentTo,
                                order,
                                ctx,
                            });

                            return {...movedNode, treeId};
                        },
                        async treeDeleteElement(
                            _,
                            {treeId, nodeId, deleteChildren}: IDeleteElementMutationArgs,
                            ctx,
                        ): Promise<string> {
                            const deletedNode = await treeDomain.deleteElement({
                                treeId,
                                nodeId,
                                deleteChildren: deleteChildren ?? true,
                                ctx,
                            });

                            return deletedNode.id;
                        },
                    },
                    Subscription: {
                        treeEvent: {
                            subscribe: withFilter(
                                () => eventsManagerDomain.subscribe([TriggerNames.TREE_EVENT]),
                                (
                                    event: PublishedEvent<{treeEvent: ITreeEvent}>,
                                    {filters}: {filters: ICommonSubscriptionFilters & ITreeEventFilters},
                                    ctx: IQueryInfos,
                                ) => {
                                    if (filters.ignoreOwnEvents && subscriptionsHelper.isOwnEvent(event, ctx)) {
                                        return false;
                                    }

                                    const {treeEvent} = event;
                                    let mustReturn = true;
                                    if (filters?.treeId) {
                                        mustReturn = treeEvent.treeId === filters.treeId;
                                    }

                                    if (mustReturn && filters?.nodes) {
                                        mustReturn =
                                            filters.nodes.includes(treeEvent.parentNode?.id ?? null) ||
                                            filters.nodes.includes(treeEvent.parentNodeBefore?.id ?? null);
                                    }

                                    if (mustReturn && filters?.events) {
                                        mustReturn = filters.events.includes(treeEvent.type);
                                    }

                                    return mustReturn;
                                },
                            ),
                        },
                    },
                    FullTreeContent: new GraphQLScalarType({
                        name: 'FullTreeContent',
                        description: `Object representing the full tree structure.
                            On each node we will have record data and children`,
                        serialize: val => val,
                        parseValue: val => val,
                        parseLiteral: ast => ast,
                    }),
                    Tree: {
                        /**
                         * Return tree label, potentially filtered by requested language
                         */
                        label: async (treeData, args) =>
                            coreApp.filterSysTranslationField(treeData.label, args.lang || []),
                        libraries: async (treeData: ITree, _, ctx: IQueryInfos): Promise<ITreeLibraryForGraphQL[]> =>
                            Promise.all(
                                Object.keys(treeData.libraries ?? {}).map(async libId => {
                                    const lib = await libraryDomain.getLibraryProperties(libId, ctx);
                                    return {library: lib, settings: treeData.libraries[libId]};
                                }),
                            ),
                        permissions_conf: (treeData: ITree): ITreePermissionsConfForGraphQL[] | null =>
                            treeData.permissions_conf
                                ? Object.keys(treeData.permissions_conf).map(libId => ({
                                      libraryId: libId,
                                      permissionsConf: treeData.permissions_conf[libId],
                                  }))
                                : null,
                        permissions: (
                            tree: ITree,
                            _,
                            ctx: IQueryInfos,
                            infos: GraphQLResolveInfo,
                        ): Promise<IKeyValue<boolean>> => {
                            const requestedActions = graphqlApp.getQueryFields(infos).map(field => field.name);
                            return requestedActions.reduce(async (allPermsProm, action) => {
                                const allPerms = await allPermsProm;

                                const isAllowed = await permissionDomain.isAllowed({
                                    type: PermissionTypes.TREE,
                                    applyTo: tree.id,
                                    action: action as TreePermissionsActions,
                                    ctx,
                                });

                                return {...allPerms, [action]: isAllowed};
                            }, Promise.resolve({}));
                        },
                        defaultElement: async (
                            treeData: ITree,
                            _,
                            ctx: IQueryInfos,
                        ): Promise<ITreeNode & {treeId?: string}> => {
                            const element = await treeDomain.getDefaultElement({treeId: treeData.id, ctx});

                            return element ? {...element, treeId: treeData.id} : null;
                        },
                    },
                    TreeNode: {
                        record: async (
                            parent: ITreeNode & {treeId?: string},
                            _,
                            ctx: IQueryInfos,
                            info: GraphQLResolveInfo,
                        ): Promise<IRecord> => {
                            const treeId =
                                parent.treeId ?? ctx.treeId ?? (await _extractTreeIdFromParent(parent, info, ctx));
                            const record = await treeDomain.getRecordByNodeId({treeId, nodeId: parent.id, ctx});
                            return record ?? null;
                        },
                        children: async (
                            parent: ITreeNode & {treeId?: string},
                            _,
                            ctx: IQueryInfos,
                            info: GraphQLResolveInfo,
                        ): Promise<ITreeNode[]> => {
                            const treeId =
                                parent.treeId ?? ctx.treeId ?? (await _extractTreeIdFromParent(parent, info, ctx));

                            let children: ITreeNode[];
                            if (typeof parent.children !== 'undefined') {
                                children = parent.children;
                            } else {
                                children = (await treeDomain.getElementChildren({treeId, nodeId: parent.id, ctx})).list;
                            }

                            // Add treeId as it might be useful for nested resolvers
                            return children.reduce(_filterTreeContentReduce(ctx, treeId), Promise.resolve([]));
                        },
                        ancestors: _getAncestors,
                        linkedRecords: async (
                            parent: ITreeNode & {treeId?: string},
                            {attribute}: {attribute: string},
                            ctx: IQueryInfos,
                        ): Promise<IRecord[]> => {
                            const attributeProps = await attributeDomain.getAttributeProperties({id: attribute, ctx});

                            return treeDomain.getLinkedRecords({
                                treeId: attributeProps.linked_tree,
                                attribute,
                                nodeId: parent.id,
                                ctx,
                            });
                        },
                        permissions: (
                            treeNode: ITreeNode & {treeId?: string},
                            _,
                            ctx: IQueryInfos,
                            infos: GraphQLResolveInfo,
                        ): Promise<IKeyValue<boolean>> => {
                            if (!treeNode.treeId) {
                                return null;
                            }

                            const requestedActions = graphqlApp.getQueryFields(infos).map(field => field.name);

                            return requestedActions.reduce(async (allPermsProm, action) => {
                                const allPerms = await allPermsProm;

                                const isAllowed = await permissionDomain.isAllowed({
                                    type: PermissionTypes.TREE_NODE,
                                    applyTo: treeNode.treeId,
                                    action: action as TreeNodePermissionsActions,
                                    target: {nodeId: treeNode.id},
                                    ctx,
                                });

                                return {...allPerms, [action]: isAllowed};
                            }, Promise.resolve({}));
                        },
                    },
                    TreeNodeLight: {
                        permissions: (
                            treeNode: ITreeNode & {treeId?: string},
                            _,
                            ctx: IQueryInfos,
                            infos: GraphQLResolveInfo,
                        ): Promise<IKeyValue<boolean>> => {
                            if (!treeNode.treeId) {
                                return null;
                            }

                            const requestedActions = graphqlApp.getQueryFields(infos).map(field => field.name);

                            return requestedActions.reduce(async (allPermsProm, action) => {
                                const allPerms = await allPermsProm;

                                const isAllowed = await permissionDomain.isAllowed({
                                    type: PermissionTypes.TREE_NODE,
                                    applyTo: treeNode.treeId,
                                    action: action as TreeNodePermissionsActions,
                                    target: {nodeId: treeNode.id},
                                    ctx,
                                });

                                return {...allPerms, [action]: isAllowed};
                            }, Promise.resolve({}));
                        },
                        ancestors: _getAncestors,
                        accessRecordByDefaultPermission: (
                            treeNode: ITreeNode & {
                                treeId?: string;
                                accessRecordByDefaultPermission?: {
                                    libraryId: string;
                                    attributeId: string;
                                };
                            },
                            _,
                            ctx: IQueryInfos,
                        ): Promise<boolean> =>
                            recordPermissionDomain.evaluateTreeValueRecordPermission({
                                action: RecordPermissionsActions.ACCESS_RECORD_BY_DEFAULT,
                                libraryId: treeNode.accessRecordByDefaultPermission.libraryId,
                                attributeId: treeNode.accessRecordByDefaultPermission.attributeId,
                                nodeId: treeNode.id,
                                ctx,
                            }),
                    },
                },
            };

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        },
    };
}
