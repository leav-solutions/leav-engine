// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeFilterOptions} from './attribute';
import {IExtensionPoints} from './extensionPoints';
import {IFormFilterOptions} from './forms';
import {ILibraryFilterOptions} from './library';
import {IPaginationParams, ISortParams} from './list';
import {ITreeFilterOptions} from './tree';

export interface IGetCoreEntitiesParams {
    filters?: IAttributeFilterOptions | ILibraryFilterOptions | ITreeFilterOptions | IFormFilterOptions;
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
