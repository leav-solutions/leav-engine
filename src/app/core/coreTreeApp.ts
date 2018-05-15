import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {ITreeDomain} from 'domain/treeDomain';
import {ITree, ITreeElement} from '_types/tree';
import {GraphQLScalarType} from 'graphql';

export interface ITreeAttributeApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(treeDomain: ITreeDomain, graphqlApp: IGraphqlApp): ITreeAttributeApp {
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
                        children: [TreeNode]
                    }

                    input TreeElementInput {
                        id: ID!,
                        library: String!
                    }

                    scalar TreeContent

                    extend type Query {
                        trees(id: ID): [Tree]

                        # Retrieve a full tree content.
                        # Fields must be an array of attribute IDs which will be
                        # retrieved on each records found in the tree.
                        treeContent(treeId: ID, fields: [ID]): TreeContent
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
                    TreeContent: new GraphQLScalarType({
                        name: 'TreeContent',
                        description: `Content of a tree,
                            represented by a hierarchical object
                            with record and children for each tree node`,
                        serialize: val => val
                    })
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
