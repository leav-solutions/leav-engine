import {IExtensionPoints} from './shared';

export interface IPluginInfos {
    name: string;
    description: string;
    version: string;
    author: string;
}

export interface IRegisteredPlugin {
    path: string;
    infos: IPluginInfos;
}

export interface IPluginInitModule {
    init: (extensionPoints: IExtensionPoints) => void;
}
