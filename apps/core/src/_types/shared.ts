// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IExtensionPoints} from './extensionPoints';
import {IPaginationParams, ISortParams} from './list';
import {ISystemTranslation} from './systemTranslation';

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
        id?: string;
        label?: string;
        system?: boolean;
        key?: string;
    }
}
