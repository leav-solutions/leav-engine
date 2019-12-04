import {IPluginsRepo} from 'infra/plugins/pluginsRepo';
import {IPluginInfos, IRegisteredPlugin} from '_types/plugin';

interface IDeps {
    'core.infra.plugins': IPluginsRepo;
}

export interface IPluginsDomain {
    registerPlugin(path: string, plugin: IPluginInfos): IRegisteredPlugin;
    getRegisteredPlugins(): IRegisteredPlugin[];
}

export default function({'core.infra.plugins': pluginsRepo}: IDeps): IPluginsDomain {
    return {
        registerPlugin(path: string, plugin: IPluginInfos): IRegisteredPlugin {
            return pluginsRepo.registerPlugin(path, plugin);
        },
        getRegisteredPlugins(): IRegisteredPlugin[] {
            return pluginsRepo.getRegisteredPlugins();
        }
    };
}
