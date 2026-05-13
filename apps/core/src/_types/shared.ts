import {type IExtensionPoints} from './extensionPoints';
import {type IPaginationParams, type ISortParams} from './list';
import {type ISystemTranslation} from './systemTranslation';

export interface IGetCoreEntitiesParams {
    filters?: ICoreEntityFilterOptions;
    strictFilters?: boolean;
    withCount?: boolean;
    pagination?: IPaginationParams;
    sort?: ISortParams;
}

export interface IAppModule {
    extensionPoints?: IExtensionPoints;
}

export interface IKeyValue<T> {
    [key: string]: T;
}

declare global {
    interface ICoreEntity {
        id?: string;
        label?: ISystemTranslation | string;
    }

    interface ICoreEntityFilterOptions {
        id?: string | string[];
        label?: string | string[];
        system?: boolean;
        key?: string;
    }
}
