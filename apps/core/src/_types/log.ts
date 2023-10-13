import {EventAction, IDbEvent, IDbPayload} from '@leav/utils';

export type Log = Omit<IDbEvent, 'payload' | 'emitter'> & IDbPayload;

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
    action?: EventAction;
    time: {
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
