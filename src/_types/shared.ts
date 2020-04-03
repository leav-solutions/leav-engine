import {IAttributeFilterOptions} from './attribute';
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

export interface IExtensionPoints {
    [name: string]: (...args: any[]) => void;
}

export interface IAppModule {
    extensionPoints?: IExtensionPoints;
}
