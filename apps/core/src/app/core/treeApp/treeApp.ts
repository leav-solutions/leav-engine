// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {GraphQLResolveInfo, GraphQLScalarType} from 'graphql';
import {omit} from 'lodash';
import {IAppGraphQLSchema} from '_types/graphql';
import {IList, IPaginationParams} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IKeyValue} from '_types/shared';
import {PermissionTypes, TreeNodePermissionsActions, TreePermissionsActions} from '../../../_types/permissions';
import {IQueryField, IRecord} from '../../../_types/record';
import {ITree, ITreeNode, ITreeNodeWithTreeId, TreeBehavior, TreePaths} from '../../../_types/tree';
import {IGraphqlApp} from '../../graphql/graphqlApp';
import {ICoreApp} from '../coreApp';
import {
    IAddElementMutationArgs,
    IDeleteElementMutationArgs,
    IMoveElementMutationArgs,
    ISaveTreeMutationArgs,
    ITreeLibraryForGraphQL,
    ITreePermissionsConfForGraphQL,
    ITreesQueryArgs
} from './_types';

export interface ITreeAttributeApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.tree'?: ITreeDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.permission'?: IPermissionDomain;
    'core.app.graphql'?: IGraphqlApp;
    'core.app.core'?: ICoreApp;
    'core.domain.library'?: ILibraryDomain;
}

export default function({
    'core.domain.tree': treeDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.permission': permissionDomain = null,
    'core.app.core': coreApp = null,
    'core.app.graphql': graphqlApp = null,
    'core.domain.library': libraryDomain = null
}: IDeps = {}): ITreeAttributeApp {
    /**
     * Retrieve parent tree attribute by recursively getting up on GraphQL query path.
     * We consider that the attribute is the first key that it's not one of our tree queries keys (ancestors, children,
     * value) and not a number (which is an array index)
     *
     * @param path
     * @return string
     */
    const _findParentAttribute = (path): string => {
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
     */
    const _extractTreeIdFromParent = async (parent, info, ctx): Promise<string> => {
        const attribute = parent.attribute ?? _findParentAttribute(info.path);
        const attributeProps = await attributeDomain.getAttributeProperties({id: attribute, ctx});
        return attributeProps.linked_tree;
    };

    const _filterTreeContentReduce = (ctx: IQueryInfos, treeId: string) => async (
        visibleNodesProm: Promise<ITreeNodeWithTreeId[]>,
        treeNode: ITreeNode
    ): Promise<ITreeNodeWithTreeId[]> => {
        const visibleNodes = await visibleNodesProm;
        const isVisible = await permissionDomain.isAllowed({
            type: PermissionTypes.TREE_NODE,
            applyTo: treeId,
            action: TreeNodePermissionsActions.ACCESS_TREE,
            target: {nodeId: treeNode.id},
            userId: ctx.userId,
            ctx
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
                        defaultElement: TreeNode
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
                        label: SystemTranslation
                        permissions_conf: [TreeNodePermissionsConfInput!]
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
                        record: Record!,
                        linkedRecords(attribute: ID): [Record!],
                        permissions: TreeNodePermissions!
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
                        id: ID,
                        label: String,
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
                        treeNodeChildren(treeId: ID!, node: ID, pagination: Pagination): TreeNodeLightList!

                        # Retrieve full tree content form tree root, as an object.
                        fullTreeContent(treeId: ID!): FullTreeContent
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
                `,
                resolvers: {
                    Query: {
                        async trees(
                            _,
                            {filters, pagination, sort}: ITreesQueryArgs,
                            ctx: IQueryInfos
                        ): Promise<IList<ITree>> {
                            return treeDomain.getTrees({params: {filters, withCount: true, pagination, sort}, ctx});
                        },
                        async treeContent(
                            _,
                            {treeId, startAt}: {treeId: string; startAt: string},
                            ctx: IQueryInfos,
                            info: GraphQLResolveInfo
                        ): Promise<ITreeNode[]> {
                            ctx.treeId = treeId;

                            const fields = graphqlApp.getQueryFields(info);
                            const hasChildrenCount = !!fields.find(f => f.name === 'childrenCount');
                            const depth = _getChildrenDepth(fields, 1);

                            const treeContent = (
                                await treeDomain.getTreeContent({
                                    treeId,
                                    startingNode: startAt,
                                    depth,
                                    childrenCount: hasChildrenCount,
                                    ctx
                                })
                            ).map(node => ({
                                ...node,
                                treeId
                            }));
                            return treeContent;
                        },
                        async treeNodeChildren(
                            _,
                            {treeId, node, pagination}: {treeId: string; node?: string; pagination?: IPaginationParams},
                            ctx: IQueryInfos,
                            info: GraphQLResolveInfo
                        ): Promise<IList<ITreeNode>> {
                            ctx.treeId = treeId;

                            const fields = graphqlApp.getQueryFields(info);
                            const hasChildrenCount = !!fields
                                .find(f => f.name === 'list')
                                ?.fields?.find(f => f.name === 'childrenCount');
                            const withTotalCount = !!fields.find(f => f.name === 'totalCount');

                            const children = await treeDomain.getElementChildren({
                                treeId,
                                nodeId: node ?? null,
                                childrenCount: hasChildrenCount,
                                withTotalCount,
                                pagination,
                                ctx
                            });

                            return {
                                ...children,
                                list: children.list.map(child => ({...child, treeId}))
                            };
                        },
                        async fullTreeContent(_, {treeId}: {treeId: string}, ctx): Promise<ITreeNode[]> {
                            return treeDomain.getTreeContent({treeId, ctx});
                        }
                    },
                    Mutation: {
                        async saveTree(_, {tree}: ISaveTreeMutationArgs, ctx: IQueryInfos): Promise<ITree> {
                            // Convert permissions conf
                            const treeToSave: Partial<ITree> = {
                                ...omit(tree, ['libraries', 'permissions_conf'])
                            };

                            if (tree.permissions_conf) {
                                treeToSave.permissions_conf = tree.permissions_conf.reduce(
                                    (acc, cur) => ({
                                        ...acc,
                                        [cur.libraryId]: cur.permissionsConf
                                    }),
                                    {}
                                );
                            }

                            if (tree.libraries) {
                                treeToSave.libraries = tree.libraries.reduce((acc, cur) => {
                                    return {...acc, [cur.library]: cur.settings};
                                }, {});
                            }

                            return treeDomain.saveTree(treeToSave as ITree, ctx);
                        },
                        async deleteTree(parent, {id}, ctx): Promise<ITree> {
                            return treeDomain.deleteTree(id, ctx);
                        },
                        async treeAddElement(
                            _,
                            {treeId, element, parent, order}: IAddElementMutationArgs,
                            ctx
                        ): Promise<ITreeNodeWithTreeId> {
                            parent = parent || null;

                            const addedNode = await treeDomain.addElement({treeId, element, parent, order, ctx});

                            return {...addedNode, treeId};
                        },
                        async treeMoveElement(
                            _,
                            {treeId, nodeId, parentTo, order}: IMoveElementMutationArgs,
                            ctx
                        ): Promise<ITreeNodeWithTreeId> {
                            parentTo = parentTo || null;
                            const movedNode = await treeDomain.moveElement({
                                treeId,
                                nodeId,
                                parentTo,
                                order,
                                ctx
                            });

                            return {...movedNode, treeId};
                        },
                        async treeDeleteElement(
                            _,
                            {treeId, nodeId, deleteChildren}: IDeleteElementMutationArgs,
                            ctx
                        ): Promise<string> {
                            const deletedNode = await treeDomain.deleteElement({
                                treeId,
                                nodeId,
                                deleteChildren: deleteChildren ?? true,
                                ctx
                            });

                            return deletedNode.id;
                        }
                    },
                    FullTreeContent: new GraphQLScalarType({
                        name: 'FullTreeContent',
                        description: `Object representing the full tree structure.
                            On each node we will have record data and children`,
                        serialize: val => val,
                        parseValue: val => val,
                        parseLiteral: ast => ast
                    }),
                    Tree: {
                        /**
                         * Return tree label, potentially filtered by requested language
                         */
                        label: async (treeData, args) => {
                            return coreApp.filterSysTranslationField(treeData.label, args.lang || []);
                        },
                        libraries: async (treeData: ITree, _, ctx: IQueryInfos): Promise<ITreeLibraryForGraphQL[]> => {
                            return Promise.all(
                                Object.keys(treeData.libraries ?? {}).map(async libId => {
                                    const lib = await libraryDomain.getLibraryProperties(libId, ctx);
                                    return {library: lib, settings: treeData.libraries[libId]};
                                })
                            );
                        },
                        permissions_conf: (treeData: ITree): ITreePermissionsConfForGraphQL[] | null => {
                            return treeData.permissions_conf
                                ? Object.keys(treeData.permissions_conf).map(libId => ({
                                      libraryId: libId,
                                      permissionsConf: treeData.permissions_conf[libId]
                                  }))
                                : null;
                        },
                        permissions: (
                            tree: ITree,
                            _,
                            ctx: IQueryInfos,
                            infos: GraphQLResolveInfo
                        ): Promise<IKeyValue<boolean>> => {
                            const requestedActions = graphqlApp.getQueryFields(infos).map(field => field.name);
                            return requestedActions.reduce(async (allPermsProm, action) => {
                                const allPerms = await allPermsProm;

                                const isAllowed = await permissionDomain.isAllowed({
                                    type: PermissionTypes.TREE,
                                    applyTo: tree.id,
                                    action: action as TreePermissionsActions,
                                    userId: ctx.userId,
                                    ctx
                                });

                                return {...allPerms, [action]: isAllowed};
                            }, Promise.resolve({}));
                        }
                    },
                    TreeNode: {
                        record: async (
                            parent: ITreeNode & {treeId?: string},
                            _,
                            ctx: IQueryInfos,
                            info: GraphQLResolveInfo
                        ): Promise<IRecord> => {
                            const treeId =
                                parent.treeId ?? ctx.treeId ?? (await _extractTreeIdFromParent(parent, info, ctx));
                            const record = await treeDomain.getRecordByNodeId({treeId, nodeId: parent.id, ctx});
                            return record;
                        },
                        children: async (
                            parent: ITreeNode & {treeId?: string},
                            _,
                            ctx: IQueryInfos,
                            info: GraphQLResolveInfo
                        ): Promise<ITreeNode[]> => {
                            const treeId =
                                parent.treeId ?? ctx.treeId ?? (await _extractTreeIdFromParent(parent, info, ctx));

                            let children = [];
                            if (typeof parent.children !== 'undefined') {
                                children = parent.children;
                            } else {
                                children = (await treeDomain.getElementChildren({treeId, nodeId: parent.id, ctx})).list;
                            }

                            // Add treeId as it might be useful for nested resolvers
                            return children.reduce(_filterTreeContentReduce(ctx, treeId), Promise.resolve([]));
                        },
                        ancestors: async (
                            parent: ITreeNode & {treeId?: string},
                            _,
                            ctx: IQueryInfos,
                            info: GraphQLResolveInfo
                        ): Promise<TreePaths> => {
                            const treeId =
                                parent.treeId ?? ctx.treeId ?? (await _extractTreeIdFromParent(parent, info, ctx));

                            const ancestors = await treeDomain.getElementAncestors({treeId, nodeId: parent.id, ctx});

                            // Add treeId as it might be useful for nested resolvers
                            return ancestors.map(n => ({...n, treeId}));
                        },
                        linkedRecords: async (
                            parent: ITreeNode & {treeId?: string},
                            {attribute}: {attribute: string},
                            ctx: IQueryInfos,
                            info: GraphQLResolveInfo
                        ): Promise<IRecord[]> => {
                            const attributeProps = await attributeDomain.getAttributeProperties({id: attribute, ctx});
                            const records = await treeDomain.getLinkedRecords({
                                treeId: attributeProps.linked_tree,
                                attribute,
                                nodeId: parent.id,
                                ctx
                            });

                            return records;
                        },
                        permissions: (
                            treeNode: ITreeNode & {treeId?: string},
                            _,
                            ctx: IQueryInfos,
                            infos: GraphQLResolveInfo
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
                                    userId: ctx.userId,
                                    target: {nodeId: treeNode.id},
                                    ctx
                                });

                                return {...allPerms, [action]: isAllowed};
                            }, Promise.resolve({}));
                        }
                    },
                    TreeNodeLight: {
                        permissions: (
                            treeNode: ITreeNode & {treeId?: string},
                            _,
                            ctx: IQueryInfos,
                            infos: GraphQLResolveInfo
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
                                    userId: ctx.userId,
                                    target: {nodeId: treeNode.id},
                                    ctx
                                });

                                return {...allPerms, [action]: isAllowed};
                            }, Promise.resolve({}));
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
