// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IPluginsDomain} from 'domain/plugins/pluginsDomain';
import {type IAppGraphQLSchema} from '_types/graphql';
import {type IPluginInfos} from '../../_types/plugin';
import {type IGraphqlAppModule} from 'app/graphql/graphqlApp';
import {type IAppModule} from '_types/shared';

export interface ICorePluginsApp extends IGraphqlAppModule, IAppModule {
    startPlugins(): Promise<void>;
    registerPlugin(path: string, plugin: IPluginInfos): void;
}

interface IDeps {
    'core.domain.plugins': IPluginsDomain;
}

export default function ({'core.domain.plugins': pluginsDomain}: IDeps): ICorePluginsApp {
    const _startFunctions: Array<() => Promise<void>> = [];
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
                        },
                    },
                },
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        registerPlugin(path: string, plugin: IPluginInfos) {
            return pluginsDomain.registerPlugin(path, plugin);
        },
        async startPlugins(): Promise<void> {
            for (const fct of _startFunctions) {
                await fct();
            }
        },
        extensionPoints: {
            registerStart: (fct: () => Promise<void>) => {
                _startFunctions.push(fct);
            },
        },
    };
}
