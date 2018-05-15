import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {ITreeDomain} from 'domain/treeDomain';
import {ITree, ITreeElement} from '_types/tree';
import {GraphQLScalarType} from 'graphql';
import {IAttributeDomain} from 'domain/attributeDomain';
import {IRecordDomain} from 'domain/recordDomain';

export interface ITreeAttributeApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(
    treeDomain: ITreeDomain,
    attributeDomain: IAttributeDomain,
    recordDomain: IRecordDomain,
    graphqlApp: IGraphqlApp
): ITreeAttributeApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    # Application TRee
                    type Tree {
                        id: ID,
                        system: Boolean,
                        libraries: [String],
                        label: SystemTranslation
                    }

                    input TreeInput {
                        id: ID!
                        libraries: [String],
                        label: SystemTranslationInput
                    }

                    type TreeElement {
                        id: ID,
                        library: String
                    }

                    type TreeNode {
                        record: Record,
                        ancestors: [TreeNode],
                        children: [TreeNode],
                        linkedRecords(attribute: ID): [Record]
                    }

                    input TreeElementInput {
                        id: ID!,
                        library: String!
                    }

                    extend type Query {
                        trees(id: ID): [Tree]

                        # Retrieve a full tree content.
                        treeContent(treeId: ID): [TreeNode]
                    }

                    extend type Mutation {
                        saveTree(tree: TreeInput): Tree
                        deleteTree(id: ID): Tree
                        treeAddElement(treeId: ID, element: TreeElementInput, parent: TreeElementInput): TreeElement
                        treeMoveElement(
                            treeId: ID,
                            element: TreeElementInput,
                            parentTo: TreeElementInput
                        ): TreeElement
                        treeDeleteElement(
                            treeId: ID,
                            element: TreeElementInput,
                            deleteChildren: Boolean
                        ): TreeElement
                    }
                `,
                resolvers: {
                    Query: {
                        async trees(parent, args) {
                            return treeDomain.getTrees(args);
                        },
                        async treeContent(_, {treeId, fields}, ctx, info) {
                            return treeDomain.getTreeContent(treeId, fields);
                        }
                    },
                    Mutation: {
                        async saveTree(parent, {tree}): Promise<ITree> {
                            return treeDomain.saveTree(tree);
                        },
                        async deleteTree(parent, {id}): Promise<ITree> {
                            return treeDomain.deleteTree(id);
                        },
                        async treeAddElement(_, {treeId, element, parent}): Promise<ITreeElement> {
                            parent = parent || null;
                            return treeDomain.addElement(treeId, element, parent);
                        },
                        async treeMoveElement(_, {treeId, element, parentTo}): Promise<ITreeElement> {
                            parentTo = parentTo || null;
                            return treeDomain.moveElement(treeId, element, parentTo);
                        },
                        async treeDeleteElement(_, {treeId, element, parent, deleteChildren}): Promise<ITreeElement> {
                            parent = parent || null;
                            deleteChildren = typeof deleteChildren !== 'undefined' ? deleteChildren : true;
                            return treeDomain.deleteElement(treeId, element, deleteChildren);
                        }
                    },
                    TreeNode: {
                        record: async (parent, args, ctx, info) => {
                            const queryFields = graphqlApp.getQueryFields(info);

                            return recordDomain.populateRecordFields(parent.record.library, parent.record, queryFields);
                        },
                        children: async (parent, args, ctx, info) => {
                            if (typeof parent.children !== 'undefined') {
                                return parent.children;
                            }

                            const element = {
                                id: parent.record.id,
                                library: parent.record.library
                            };

                            const attribute = info.path.prev.prev.prev.key;
                            const attributeProps = await attributeDomain.getAttributeProperties(attribute);

                            return treeDomain.getElementChildren(attributeProps.linked_tree, element);
                        },
                        ancestors: async (parent, args, ctx, info) => {
                            const element = {
                                id: parent.record.id,
                                library: parent.record.library
                            };

                            const attribute = info.path.prev.prev.prev.key;
                            const attributeProps = await attributeDomain.getAttributeProperties(attribute);

                            return treeDomain.getElementAncestors(attributeProps.linked_tree, element);
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

                            return Promise.all(
                                records.map(record =>
                                    recordDomain.populateRecordFields(record.library, record, queryFields)
                                )
                            );
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
