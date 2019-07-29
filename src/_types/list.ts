export interface IList<T> {
    totalCount: number;
    list: T[];
}

export interface IPaginationParams {
    limit: number;
    offset: number;
}
