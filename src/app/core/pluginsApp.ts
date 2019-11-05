import {IAppGraphQLSchema} from 'app/graphql/graphqlApp';
import {IPlugin} from '../../_types/plugin';

export interface ICorePluginsApp {
    registerPlugin(plugin: IPlugin): void;
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(): ICorePluginsApp {
    const _loadedPlugins: IPlugin[] = [];

    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type Plugin {
                        name: String!,
                        description: String,
                        version: String,
                        author: String
                    }

                    extend type Query {
                        plugins: [Plugin!]!
                    }
                `,
                resolvers: {
                    Query: {
                        plugins() {
                            return _loadedPlugins;
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        registerPlugin(plugin: IPlugin) {
            _loadedPlugins.push(plugin);
        }
    };
}
