import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
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

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
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
                        async trees(parent, {filters, pagination, sort}) {
                            return treeDomain.getTrees({filters, withCount: true, pagination, sort});
                        },
                        async treeContent(_, {treeId, startAt}, ctx, info) {
                            ctx.treeId = treeId;
                            return treeDomain.getTreeContent(treeId, startAt);
                        }
                    },
                    Mutation: {
                        async saveTree(parent, {tree}, ctx): Promise<ITree> {
                            return treeDomain.saveTree(tree, graphqlApp.ctxToQueryInfos(ctx));
                        },
                        async deleteTree(parent, {id}, ctx): Promise<ITree> {
                            return treeDomain.deleteTree(id, graphqlApp.ctxToQueryInfos(ctx));
                        },
                        async treeAddElement(_, {treeId, element, parent, order}): Promise<ITreeElement> {
                            parent = parent || null;
                            return treeDomain.addElement(treeId, element, parent, order);
                        },
                        async treeMoveElement(_, {treeId, element, parentTo, order}): Promise<ITreeElement> {
                            parentTo = parentTo || null;
                            return treeDomain.moveElement(treeId, element, parentTo, order);
                        },
                        async treeDeleteElement(_, {treeId, element, parent, deleteChildren}): Promise<ITreeElement> {
                            parent = parent || null;
                            deleteChildren = typeof deleteChildren !== 'undefined' ? deleteChildren : true;
                            return treeDomain.deleteElement(treeId, element, deleteChildren);
                        }
                    },
                    Tree: {
                        /**
                         * Return tree label, potentially filtered by requested language
                         */
                        label: async (treeData, args) => {
                            return coreApp.filterSysTranslationField(treeData.label, args.lang || []);
                        },
                        libraries: async (treeData, args) => {
                            return Promise.all(
                                treeData.libraries.map(async libId => {
                                    const lib = await libraryDomain.getLibraries({
                                        filters: {id: libId},
                                        strictFilters: true
                                    });
                                    return lib.list[0];
                                })
                            );
                        }
                    },
                    TreeNode: {
                        children: async (parent, args, ctx, info) => {
                            if (typeof parent.children !== 'undefined') {
                                return parent.children;
                            }

                            const element = {
                                id: parent.record.id,
                                library: parent.record.library
                            };

                            // When coming from 'treeContent' call, treeId is set on context. Otherwise,
                            // we have to retrieve parent tree attributes to find out which tree we must use
                            let treeId;
                            if (typeof ctx.treeId === 'undefined') {
                                const attribute = _findParentAttribute(info.path);
                                const attributeProps = await attributeDomain.getAttributeProperties(attribute);
                                treeId = attributeProps.linked_tree;
                            } else {
                                treeId = ctx.treeId;
                            }

                            return treeDomain.getElementChildren(treeId, element);
                        },
                        ancestors: async (parent, args, ctx, info) => {
                            const element = {
                                id: parent.record.id,
                                library: parent.record.library
                            };

                            // When coming from 'treeContent' call, treeId is set on context. Otherwise,
                            // we have to retrieve parent tree attributes to find out which tree we must use
                            let treeId;
                            if (typeof ctx.treeId === 'undefined') {
                                const attribute = _findParentAttribute(info.path);
                                const attributeProps = await attributeDomain.getAttributeProperties(attribute);
                                treeId = attributeProps.linked_tree;
                            } else {
                                treeId = ctx.treeId;
                            }

                            return treeDomain.getElementAncestors(treeId, element);
                        },
                        linkedRecords: async (parent, {attribute}, ctx, info) => {
                            const queryFields = graphqlApp.getQueryFields(info);
                            const attributeProps = await attributeDomain.getAttributeProperties(attribute);
                            const element = {
                                id: parent.record.id,
                                library: parent.record.library
                            };
                            const records = await treeDomain.getLinkedRecords(
                                attributeProps.linked_tree,
                                attribute,
                                element
                            );

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
