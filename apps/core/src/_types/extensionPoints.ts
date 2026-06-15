import {type IActionsListFunction} from './actionsList';
import {type IAppGraphQLSchema} from './graphql';
import {type PermissionTypes} from './permissions';
import {type PluginRegisterRoute} from './endpoint';
import {type AuthPostOidcLoginCallback} from './auth';
import {type RegisterCronTask} from './cronTask';
import {type ITRPCRouterFactory} from '../app/trpc/trpcApp';
import {type IAutomationAction} from '../domain/automation/actions/_types';
import {type ISDOMappingFunctions} from './sdo';

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
    registerTRPCRouter: (initRouter: ITRPCRouterFactory) => void;
    registerTranslations: (path: string) => Promise<void>;
    registerPermissionActions: (type: PermissionTypes, actions: string[], applyOn?: string[]) => void;
    registerEventActions: (actions: string[], prefix: string) => void;
    registerActions: (actions: IActionsListFunction[]) => void;
    registerAutomationAction: <P = Record<string, unknown>>(action: IAutomationAction<P>) => void;
    registerTaskTypes: (types: string[]) => void;
    registerStart: (fct: () => Promise<void>) => void;
    /**
     * Method to register some Express routes inside LEAV Core.
     *
     * This method is called automatically by `leav-engine/apps/core/src/pluginsLoader.ts`.
     *
     * @param {PluginRegisterRoute[]} routes - list of routes to register
     */
    registerRoutes: (routes: PluginRegisterRoute[]) => void;

    /**
     * Method to register a callback to be executed after a successful OIDC login.
     *
     * Useful to change user settings or to log some information after the user is authenticated but before the session is created.
     */
    registerAuthPostOidcLoginCallback: (callback: AuthPostOidcLoginCallback) => void;

    /**
     * Register a cron task to be executed on a schedule defined by the `schedule` property of `registerCronTask`.
     */
    registerCronTask: (registerCronTask: RegisterCronTask) => void;

    /**
     * Register SDO export mapping functions.
     *
     * @param {ISDOMappingFunctions} mappingFunctions - mapping functions to register
     */
    registerSDOExportMappingFunctions: (mappingFunctions: ISDOMappingFunctions) => void;
}
