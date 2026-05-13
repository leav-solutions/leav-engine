import {type IDbDocument} from '../db/_types';

export interface IChildrenResultNode {
    id: string;
    record: IDbDocument;
    order: number;
    childrenCount?: number;
}

export const NODE_LIBRARY_ID_FIELD = 'libraryId';
export const NODE_RECORD_ID_FIELD = 'recordId';
