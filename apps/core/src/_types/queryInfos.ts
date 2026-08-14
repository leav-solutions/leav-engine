import type DataLoader from 'dataloader';
import type LeavError from '../errors/LeavError';
import {type IDbProfiler} from './dbProfiler';
import {type IValueVersion} from './value';

// TODO better specify this type
// https://aristid.atlassian.net/browse/LEAVC-831
export interface IQueryInfos {
    userId: string;
    groupsId?: string[];
    lang?: string;
    defaultLang?: string;
    queryId?: string;
    version?: IValueVersion;
    treeId?: string;
    applicationId?: string;
    dbProfiler?: IDbProfiler;
    trigger?: string;
    /**
     * Number of chained automation executions ("rebounds") that led to the current operation.
     * Undefined or 0 on user-initiated operations; incremented (by copy, never in place) each time
     * an automation pipeline runs. Used by triggerRules to cut infinite rule chains.
     */
    automationDepth?: number;
    errors?: Array<LeavError<unknown>>;

    /**
     * For request duration store dataloader on demand with getOrCreateDataLoaderInCtx
     */
    dataLoaders?: Record<string, DataLoader<unknown, unknown>>;
}
