// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IDbDocument} from 'infra/db/_types';

export interface IChildrenResultNode {
    id: string;
    record: IDbDocument;
    order: number;
    childrenCount?: number;
}

export const NODE_LIBRARY_ID_FIELD = 'libraryId';
export const NODE_RECORD_ID_FIELD = 'recordId';
