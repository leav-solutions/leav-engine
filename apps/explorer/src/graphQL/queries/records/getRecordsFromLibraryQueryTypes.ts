// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SortOrder} from '_gqlTypes/globalTypes';
import {RecordIdentity} from '_gqlTypes/RecordIdentity';
import {IQueryFilter} from '../../../_types/types';

export interface IGetRecordsFromLibraryQueryElement extends RecordIdentity {
    [x: string]: any;
}

export interface IGetRecordsFromLibraryQuery {
    [x: string]: {
        list: IGetRecordsFromLibraryQueryElement[];
        totalCount: number;
    };
}

export interface IGetRecordsFromLibraryQueryVariables {
    limit?: number;
    offset?: number;
    filters?: IQueryFilter[];
    sortField?: string;
    sortOrder: SortOrder;
    fullText?: string;
}
