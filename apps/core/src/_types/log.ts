import {type EventAction, type Log as LogExternal} from '@leav/utils';
import {type IDbPayloadInternal} from './events';

export interface ILogTopicFilter {
    record?: {
        id: string;
        libraryId: string;
    };
    library?: string;
    attribute?: string;
    tree?: string;
    profile?: string;
    permission?: {
        type?: string;
        applyTo?: any;
    };
    apiKey?: string;
    application?: string;
    filename?: string;
}

export interface ILogFilters {
    actions?: EventAction[];
    time?: {
        from?: number;
        to?: number;
    };
    userId?: string;
    queryId?: string;
    instanceId?: string;
    topic?: ILogTopicFilter;
}

export interface ILogSort {
    field: string;
    order: 'asc' | 'desc';
}

export interface ILogPagination {
    limit: number;
    offset: number;
}

export type Log<EA extends EventAction = EventAction> = LogExternal & IDbPayloadInternal<EA>;

export interface ILogResponse {
    logs: Log[];
    total: number;
}
