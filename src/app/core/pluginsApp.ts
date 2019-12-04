import {IAppGraphQLSchema} from 'app/graphql/graphqlApp';
import {IPluginsDomain} from 'domain/plugins/pluginsDomain';
import {IPluginInfos} from '../../_types/plugin';

export interface ICorePluginsApp {
    registerPlugin(path: string, plugin: IPluginInfos): void;
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.plugins': IPluginsDomain;
}

export default function({'core.domain.plugins': pluginsDomain}: IDeps): ICorePluginsApp {
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
                            return pluginsDomain.getRegisteredPlugins().map(p => p.infos);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        registerPlugin(path: string, plugin: IPluginInfos) {
            return pluginsDomain.registerPlugin(path, plugin);
        }
    };
}
