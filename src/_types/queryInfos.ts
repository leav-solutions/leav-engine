import {IValueVersion} from './value';

export interface IQueryInfos {
    userId?: number;
    lang?: string;
    queryId?: string;
    version?: IValueVersion;
}
