// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IList<T> {
    totalCount: number;
    list: T[];
}

export enum CursorDirection {
    PREV = 'prev',
    NEXT = 'next'
}

export interface IPaginationCursors {
    prev?: string;
    next?: string;
}

export interface IListWithCursor<T> extends IList<T> {
    cursor: IPaginationCursors;
}

export interface IPaginationParams {
    limit: number;
    offset: number;
}

export interface ICursorPaginationParams {
    limit: number;
    cursor: string;
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

export interface ISortParams {
    field: string;
    order: SortOrder;
}
