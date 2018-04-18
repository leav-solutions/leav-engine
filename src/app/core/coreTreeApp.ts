import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {ITreeDomain} from 'domain/treeDomain';
import {ITree, ITreeElement} from '_types/tree';

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

                    input TreeElementInput {
                        id: ID!,
                        library: String!
                    }

                    extend type Query {
                        trees(id: ID): [Tree]
                    }

                    extend type Mutation {
                        saveTree(tree: TreeInput): Tree
                        deleteTree(id: ID): Tree
                        treeAddElement(treeId: ID, element: TreeElementInput, parent: TreeElementInput): TreeElement
                        treeMoveElement(
                            treeId: ID,
                            element: TreeElementInput,
                            parentFrom: TreeElementInput,
                            parentTo: TreeElementInput
                        ): TreeElement
                        treeDeleteElement(
                            treeId: ID,
                            element: TreeElementInput,
                            parent: TreeElementInput,
                            deleteChildren: Boolean
                        ): TreeElement
                    }
                `,
                resolvers: {
                    Query: {
                        async trees(parent, args) {
                            return treeDomain.getTrees(args);
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
                        async treeMoveElement(_, {treeId, element, parentFrom, parentTo}): Promise<ITreeElement> {
                            parentFrom = parentFrom || null;
                            parentTo = parentTo || null;
                            return treeDomain.moveElement(treeId, element, parentFrom, parentTo);
                        },
                        async treeDeleteElement(_, {treeId, element, parent, deleteChildren}): Promise<ITreeElement> {
                            parent = parent || null;
                            deleteChildren = typeof deleteChildren !== 'undefined' ? deleteChildren : true;
                            return treeDomain.deleteElement(treeId, element, parent, deleteChildren);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
