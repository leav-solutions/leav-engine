// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
        id?: string | string[];
        label?: string | string[];
        system?: boolean;
        key?: string;
    }
}
