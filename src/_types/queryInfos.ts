import {IValueVersion} from './value';

export interface IQueryInfos {
    userId?: string;
    lang?: string;
    queryId?: string;
    version?: IValueVersion;
}
