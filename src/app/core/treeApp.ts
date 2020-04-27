import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {GraphQLScalarType} from 'graphql';
import {isNumber} from 'util';
import {ITree, ITreeElement, TreeBehavior} from '../../_types/tree';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {ICoreApp} from './coreApp';

export interface ITreeAttributeApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.tree'?: ITreeDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.app.graphql'?: IGraphqlApp;
    'core.app.core'?: ICoreApp;
    'core.domain.library'?: ILibraryDomain;
}

export default function({
    'core.domain.tree': treeDomain = null,
    'core.domain.attribute': attributeDomain = null,
    'core.app.graphql': graphqlApp = null,
    'core.app.core': coreApp = null,
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

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    scalar FullTreeContent

                    enum TreeBehavior {
                        ${Object.values(TreeBehavior).join(' ')}
                    }

                    # Application TRee
                    type Tree {
                        id: ID!,
                        system: Boolean!,
                        libraries: [Library!]!,
                        behavior: TreeBehavior!,
                        label(lang: [AvailableLanguage!]): SystemTranslation
                    }

                    input TreeInput {
                        id: ID!
                        libraries: [String!],
                        behavior: TreeBehavior,
                        label: SystemTranslationInput
                    }

                    type TreeElement {
                        id: ID,
                        library: String
                    }

                    type TreeNode {
                        order: Int!,
                        record: Record!,
                        ancestors: [TreeNode!],
                        children: [TreeNode!],
                        linkedRecords(attribute: ID): [Record!]
                    }

                    input TreeElementInput {
                        id: ID!,
                        library: String!
                    }

                    input TreesFiltersInput {
                        id: ID,
                        label: String,
                        system: Boolean,
                        behavior: TreeBehavior
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
                        async trees(parent, {filters, pagination, sort}, ctx) {
                            return treeDomain.getTrees({params: {filters, withCount: true, pagination, sort}, ctx});
                        },
                        async treeContent(_, {treeId, startAt}: {treeId: string; startAt: ITreeElement}, ctx) {
                            const res = await treeDomain.getTreeContent({treeId, startingNode: startAt, ctx});

                            // Add treeId as it might be useful for nested resolvers
                            return res.map(r => ({...r, treeId}));
                        },
                        async fullTreeContent(_, {treeId}: {treeId: string}, ctx) {
                            return treeDomain.getTreeContent({treeId, ctx});
                        }
                    },
                    Mutation: {
                        async saveTree(parent, {tree}, ctx): Promise<ITree> {
                            return treeDomain.saveTree(tree, ctx);
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
                        libraries: async (treeData, args, ctx) => {
                            return Promise.all(
                                treeData.libraries.map(async libId => {
                                    const lib = await libraryDomain.getLibraries({
                                        params: {
                                            filters: {id: libId},
                                            strictFilters: true
                                        },
                                        ctx
                                    });
                                    return lib.list[0];
                                })
                            );
                        }
                    },
                    TreeNode: {
                        children: async (parent, _, ctx, info) => {
                            if (typeof parent.children !== 'undefined') {
                                return parent.children;
                            }

                            const element = {
                                id: parent.record.id,
                                library: parent.record.library
                            };

                            const treeId = parent.treeId ?? (await _extractTreeIdFromParent(parent, info, ctx));

                            const children = await treeDomain.getElementChildren({treeId, element, ctx});

                            // Add treeId as it might be useful for nested resolvers
                            return children.map(n => ({...n, treeId}));
                        },
                        ancestors: async (parent, _, ctx, info) => {
                            const element = {
                                id: parent.record.id,
                                library: parent.record.library
                            };

                            const treeId = parent.treeId ?? (await _extractTreeIdFromParent(parent, info, ctx));

                            const ancestors = await treeDomain.getElementAncestors({treeId, element, ctx});

                            // Add treeId as it might be useful for nested resolvers
                            return ancestors.map(n => ({...n, treeId}));
                        },
                        linkedRecords: async (parent, {attribute}, ctx, info) => {
                            const attributeProps = await attributeDomain.getAttributeProperties(attribute);
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
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
