// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListFunction} from './actionsList';
import {IAppGraphQLSchema} from './graphql';
import {PermissionTypes} from './permissions';

export interface IExtensionPoints {
    [name: string]: (...args: any[]) => void;
}

export interface IExtensionPointsFunctions extends IExtensionPoints {
    registerGraphQLSchema: (schemaPart: IAppGraphQLSchema) => void;
    registerTranslations: (path: string) => Promise<void>;
    registerPermissionActions: (type: PermissionTypes, actions: string[], applyOn?: string[]) => void;
    registerEventActions: (actions: string[], prefix: string) => void;
    registerActions: (actions: IActionsListFunction[]) => void;
}
