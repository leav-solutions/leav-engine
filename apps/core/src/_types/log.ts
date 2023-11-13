// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction} from '@leav/utils';

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
