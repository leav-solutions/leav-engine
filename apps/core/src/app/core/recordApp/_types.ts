// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Override} from '@leav/utils';
import {IRecordFilterLight, IRecordSortLight} from '_types/record';
import {IValue, IValueVersionFromGql} from '_types/value';

export type ICreateRecordValue = Override<
    Omit<IValue, 'version'>,
    {
        value: IValue['payload']; // For backward compatibility
        metadata: Array<{
            name: string;
            value: string;
        }>;
    }
>;

export interface ICreateRecordParams {
    library: string;
    data?: {
        values: ICreateRecordValue[];
        version: IValueVersionFromGql;
    };
}

export interface IRecordsQueryVersion {
    treeId: string;
    treeNodeId: string;
}

export interface IRecordsQueryPagination {
    limit: number;
    offset?: number;
    cursor?: string;
}

export interface IRecordsQueryVariables {
    library: string;
    filters?: IRecordFilterLight[];
    sort?: IRecordSortLight;
    version?: IRecordsQueryVersion[];
    pagination?: IRecordsQueryPagination;
    retrieveInactive?: boolean;
    searchQuery?: string;
}
