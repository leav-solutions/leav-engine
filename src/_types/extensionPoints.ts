import {IAppGraphQLSchema} from './graphql';
import {PermissionTypes} from './permissions';

export interface IExtensionPoints {
    [name: string]: (...args: any[]) => void;
}

export interface IExtensionPointsFunctions extends IExtensionPoints {
    registerGraphQLSchema: (schemaPart: IAppGraphQLSchema) => void;
    registerTranslations: (path: string) => Promise<void>;
    registerPermissionActions: (type: PermissionTypes, actions: string[], applyOn?: string[]) => void;
}
