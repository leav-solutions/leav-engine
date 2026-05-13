import {type LibraryBehavior} from '../../../_types/library';
import {type SortOrder} from '../../../_types/list';

export interface IGetLibraryParams {
    filters?: {id?: string[]; label?: string[]; system?: boolean; behavior?: LibraryBehavior[]};
    pagination?: {limit: number; offset: number};
    sort?: {field: string; order: SortOrder};
    strictFilters?: boolean;
}
