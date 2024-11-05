// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListFunction} from './actionsList';
import {IAppGraphQLSchema} from './graphql';
import {PermissionTypes} from './permissions';
import {PluginRegisterRoute} from './endpoint';

export interface IExtensionPoints {
    [name: string]: (...args: any[]) => void;
}

export interface IExtensionPointsFunctions extends IExtensionPoints {
    /**
     * Method to extend graphQL schema.
     *
     * This method is called automatically by `leav-engine/apps/core/src/pluginsLoader.ts`.
     *
     * @param {IAppGraphQLSchema} schemaPart
     */
    registerGraphQLSchema: (schemaPart: IAppGraphQLSchema) => void;
    registerTranslations: (path: string) => Promise<void>;
    registerPermissionActions: (type: PermissionTypes, actions: string[], applyOn?: string[]) => void;
    registerEventActions: (actions: string[], prefix: string) => void;
    registerActions: (actions: IActionsListFunction[]) => void;
    /**
     * Method to register some Express routes inside LEAV Core.
     *
     * This method is called automatically by `leav-engine/apps/core/src/pluginsLoader.ts`.
     *
     * @param {PluginRegisterRoute[]} routes - list of routes to register
     */
    registerRoutes: (routes: PluginRegisterRoute[]) => void;
}
