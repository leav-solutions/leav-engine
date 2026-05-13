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
    errors?: Array<LeavError<unknown>>;

    /**
     * For request duration store dataloader on demand with getOrCreateDataLoaderInCtx
     */
    dataLoaders?: Record<string, DataLoader<unknown, unknown>>;
}
