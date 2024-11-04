// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPluginsRepo} from 'infra/plugins/pluginsRepo';
import {IPluginInfos, IRegisteredPlugin} from '_types/plugin';

interface IDeps {
    'core.infra.plugins': IPluginsRepo;
}

export interface IPluginsDomain {
    registerPlugin(path: string, plugin: IPluginInfos): IRegisteredPlugin;
    getRegisteredPlugins(): IRegisteredPlugin[];
}

export default function ({'core.infra.plugins': pluginsRepo}: IDeps): IPluginsDomain {
    return {
        registerPlugin(path: string, plugin: IPluginInfos): IRegisteredPlugin {
            return pluginsRepo.registerPlugin(path, plugin);
        },
        getRegisteredPlugins(): IRegisteredPlugin[] {
            return pluginsRepo.getRegisteredPlugins();
        }
    };
}
