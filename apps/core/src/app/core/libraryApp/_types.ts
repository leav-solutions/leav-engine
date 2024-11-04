// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LibraryBehavior} from '_types/library';
import {SortOrder} from '_types/list';

export interface IGetLibraryParams {
    filters?: {id?: string[]; label?: string[]; system?: boolean; behavior?: LibraryBehavior[]};
    pagination?: {limit: number; offset: number};
    sort?: {field: string; order: SortOrder};
    strictFilters?: boolean;
}
