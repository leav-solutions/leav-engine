import {IExtensionPointsFunctions} from './extensionPoints';

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
    init: (extensionPoints: IExtensionPointsFunctions) => void;
}
