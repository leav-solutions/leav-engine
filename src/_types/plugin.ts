import {IExtensionPoints} from './shared';

export interface IPlugin {
    name: string;
    description: string;
    version: string;
    author: string;
}

export interface IPluginInitModule {
    init: (extensionPoints: IExtensionPoints) => void;
}
