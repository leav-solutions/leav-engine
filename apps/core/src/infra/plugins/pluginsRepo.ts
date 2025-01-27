// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPluginInfos, IRegisteredPlugin} from '_types/plugin';

export interface IPluginsRepo {
    registerPlugin(path: string, plugin: IPluginInfos): IRegisteredPlugin;
    getRegisteredPlugins(): IRegisteredPlugin[];
}

export default function (): IPluginsRepo {
    const _registeredPlugins: IRegisteredPlugin[] = [];

    return {
        registerPlugin(path: string, plugin: IPluginInfos): IRegisteredPlugin {
            const pluginToRegister = {path, infos: {...plugin}};
            _registeredPlugins.push(pluginToRegister);

            return pluginToRegister;
        },
        getRegisteredPlugins(): IRegisteredPlugin[] {
            return _registeredPlugins.sort((a, b) => a.infos.name.localeCompare(b.infos.name));
        }
    };
}
