// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
