// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {AqlQuery} from 'arangojs/aql';
import {IQueryInfos} from '_types/queryInfos';

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

export const isExecuteWithCount = (res: IExecuteWithCount<unknown> | unknown[]): res is IExecuteWithCount<unknown> =>
    typeof (res as IExecuteWithCount).results !== 'undefined';
