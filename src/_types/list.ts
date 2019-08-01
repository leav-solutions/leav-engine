export interface IList<T> {
    totalCount: number;
    list: T[];
}

export interface IPaginationParams {
    limit: number;
    offset: number;
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

export interface ISortParams {
    field: string;
    order: SortOrder;
}
