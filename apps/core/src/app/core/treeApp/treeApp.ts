// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {GraphQLResolveInfo, GraphQLScalarType} from 'graphql';
import {omit} from 'lodash';
import {isNumber} from 'util';
import {IAppGraphQLSchema} from '_types/graphql';
import {IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IKeyValue} from '_types/shared';
import {PermissionTypes, TreeNodePermissionsActions, TreePermissionsActions} from '../../../_types/permissions';
import {IRecord} from '../../../_types/record';
import {ITree, ITreeElement, ITreeNode, ITreeNodeWithTreeId, TreeBehavior, TreePaths} from '../../../_types/tree';
import {IGraphqlApp} from '../../graphql/graphqlApp';
import {ICoreApp} from '../coreApp';
import {ISaveTreeMutationArgs, ITreeLibraryForGraphQL, ITreePermissionsConfForGraphQL, ITreesQueryArgs} from './_types';

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

export default function ({
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
        const restrictedKeys = ['ancestors', 'children', 'value'];
        if (!restrictedKeys.includes(path.key) && !isNumber(path.key)) {
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
            target: {
                recordId: treeNode.record.id,
                libraryId: treeNode.record.library
            },
            userId: ctx.userId,
            ctx
        });

        if (isVisible) {
            visibleNodes.push({...treeNode, treeId});
        }

        return visibleNodes;
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
                        label(lang: [AvailableLanguage!]): SystemTranslation
                        permissions_conf: [TreeNodePermissionsConf!],
                        permissions: TreePermissions!
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
                        order: Int!,
                        record: Record!,
                        ancestors: [[TreeNode!]!],
                        children: [TreeNode!],
                        linkedRecords(attribute: ID): [Record!],
                        permissions: TreeNodePermissions!
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
                        treeContent(treeId: ID!, startAt: TreeElementInput): [TreeNode!]

                        # Retrieve full tree content form tree root, as an object.
                        fullTreeContent(treeId: ID!): FullTreeContent
                    }

                    extend type Mutation {
                        saveTree(tree: TreeInput!): Tree!
                        deleteTree(id: ID!): Tree!
                        treeAddElement(
                            treeId: ID!,
                            element: TreeElementInput!,
                            parent: TreeElementInput,
                            order: Int
                        ): TreeElement!
                        treeMoveElement(
                            treeId: ID!,
                            element: TreeElementInput!,
                            parentTo: TreeElementInput,
                            order: Int
                        ): TreeElement!
                        treeDeleteElement(
                            treeId: ID!,
                            element: TreeElementInput!,
                            deleteChildren: Boolean
                        ): TreeElement!
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
                            {treeId, startAt}: {treeId: string; startAt: ITreeElement},
                            ctx: IQueryInfos
                        ): Promise<ITreeNode[]> {
                            ctx.treeId = treeId;

                            return (await treeDomain.getTreeContent({treeId, startingNode: startAt, ctx})).reduce(
                                _filterTreeContentReduce(ctx, treeId),
                                Promise.resolve([])
                            );
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
                        async treeAddElement(_, {treeId, element, parent, order}, ctx): Promise<ITreeElement> {
                            parent = parent || null;
                            return treeDomain.addElement({treeId, element, parent, order, ctx});
                        },
                        async treeMoveElement(_, {treeId, element, parentTo, order}, ctx): Promise<ITreeElement> {
                            parentTo = parentTo || null;
                            return treeDomain.moveElement({treeId, element, parentTo, order, ctx});
                        },
                        async treeDeleteElement(
                            _,
                            {treeId, element, parent, deleteChildren},
                            ctx
                        ): Promise<ITreeElement> {
                            parent = parent || null;
                            deleteChildren = typeof deleteChildren !== 'undefined' ? deleteChildren : true;
                            return treeDomain.deleteElement({treeId, element, deleteChildren, ctx});
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
                                    const lib = await libraryDomain.getLibraries({
                                        params: {
                                            filters: {id: libId},
                                            strictFilters: true
                                        },
                                        ctx
                                    });
                                    return {library: lib.list[0], settings: treeData.libraries[libId]};
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
                                const element = {
                                    id: parent.record.id,
                                    library: parent.record.library
                                };

                                children = await treeDomain.getElementChildren({treeId, element, ctx});
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
                            const element = {
                                id: parent.record.id,
                                library: parent.record.library
                            };

                            const treeId =
                                parent.treeId ?? ctx.treeId ?? (await _extractTreeIdFromParent(parent, info, ctx));

                            const ancestors = await treeDomain.getElementAncestors({treeId, element, ctx});

                            // Add treeId as it might be useful for nested resolvers
                            return ancestors.map(path => path.map(n => ({...n, treeId})));
                        },
                        linkedRecords: async (
                            parent: ITreeNode & {treeId?: string},
                            {attribute}: {attribute: string},
                            ctx: IQueryInfos,
                            info: GraphQLResolveInfo
                        ): Promise<IRecord[]> => {
                            const attributeProps = await attributeDomain.getAttributeProperties({id: attribute, ctx});
                            const element = {
                                id: parent.record.id,
                                library: parent.record.library
                            };
                            const records = await treeDomain.getLinkedRecords({
                                treeId: attributeProps.linked_tree,
                                attribute,
                                element,
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
                                    target: {
                                        recordId: treeNode.record.id,
                                        libraryId: treeNode.record.library
                                    },
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
