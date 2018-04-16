import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';
import {ITreeDomain} from 'domain/treeDomain';
import {ITree} from '_types/tree';

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

                    extend type Query {
                        trees(id: ID): [Tree]
                    }

                    extend type Mutation {
                        saveTree(tree: TreeInput): Tree
                        deleteTree(id: ID): Tree
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
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
