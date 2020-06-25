import {ILabel, IQueryFilter, OrderSearch} from '../../_types/types';

export interface IGetRecordsFromLibraryQueryElement {
    [x: string]: any;
    whoAmI: {
        id: string;
        label: ILabel;
        color: string;
        preview: {
            small: string;
            medium: string;
            big: string;
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
    sortField: string;
    sortOrder: OrderSearch;
}
