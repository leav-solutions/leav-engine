// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3

import {AqlQuery} from 'arangojs/lib/cjs/aql-query';
import {IQueryInfos} from '_types/queryInfos';

// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IDbDocument {
    _id: string;
    _key: string;
    _rev: string;
    [key: string]: any;
}

export interface IDbEdge extends IDbDocument {
    _from: string;
    _to: string;
}

export interface IExecute {
    query: string | AqlQuery;
    ctx: IQueryInfos;
    withTotalCount?: boolean;
    attempts?: number;
}

export interface IExecuteWithCount<T = IDbDocument> {
    totalCount: number;
    results: T[];
}

export const isExecuteWithCount = (res: IExecuteWithCount<unknown> | unknown[]): res is IExecuteWithCount<unknown> => {
    return typeof (res as IExecuteWithCount).results !== 'undefined';
};
