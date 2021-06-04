// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SortOrder} from '_gqlTypes/globalTypes';
import {ILabel, IQueryFilter} from '../../../_types/types';

export interface IGetRecordsFromLibraryQueryElement {
    [x: string]: any;
    whoAmI: {
        id: string;
        label: ILabel;
        color?: string;
        preview?: {
            small: string;
            medium: string;
            big: string;
            pages: string;
        };
        library: {
            id: string;
            label: ILabel;
        };
    };
}

export interface IGetRecordsFromLibraryQuery {
    [x: string]: {
        list: IGetRecordsFromLibraryQueryElement[];
        totalCount: number;
    };
}

export interface IGetRecordsFromLibraryQueryVariables {
    limit: number;
    offset: number;
    filters: IQueryFilter[];
    sortField?: string;
    sortOrder: SortOrder;
}
