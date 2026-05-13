import {type AqlQuery} from 'arangojs/aql';

export interface IDbProfilerQuery {
    count: number;
    query: string | AqlQuery;
    callers: Record<
        string,
        {
            /**
             * Stacktrace of caller
             */
            stack: string;
            count: number;

            /**
             * Stats for each call for that query
             */
            stats: Array<{
                /**
                 * Arangodb query execution time in ms
                 */
                executionTimeMs: number | null;
                /**
                 * Time spent in nodejs to process the query in ms
                 */
                nodejsTimeMs: number;
            }>;
        }
    >;
}

export interface IDbProfiler {
    totalCount: number;
    uniqueQueriesCount: number;
    queries: {
        [key: string]: IDbProfilerQuery;
    };
}
