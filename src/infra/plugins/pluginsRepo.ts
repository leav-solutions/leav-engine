import {IPluginInfos, IRegisteredPlugin} from '_types/plugin';

export interface IPluginsRepo {
    registerPlugin(path: string, plugin: IPluginInfos): IRegisteredPlugin;
    getRegisteredPlugins(): IRegisteredPlugin[];
}

export default function(): IPluginsRepo {
    const _registeredPlugins: IRegisteredPlugin[] = [];
    return {
        registerPlugin(path: string, plugin: IPluginInfos): IRegisteredPlugin {
            const pluginToRegister = {path, infos: {...plugin}};
            _registeredPlugins.push(pluginToRegister);

            return pluginToRegister;
        },
        getRegisteredPlugins(): IRegisteredPlugin[] {
            return _registeredPlugins;
        }
    };
}
