// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AqlQuery} from 'arangojs/lib/cjs/aql-query';

export interface IDbProfilerQuery {
    count: number;
    query: string | AqlQuery;
    callers: Set<string>;
}

export interface IDbProfiler {
    totalCount: number;
    uniqueQueriesCount: number;
    queries: {
        [key: string]: IDbProfilerQuery;
    };
}
