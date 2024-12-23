// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
    // @deprecated Should use multipleSort. They are both here for backward compatibility. Eventually, multipleSort will replace sort.
    sort?: IRecordSortLight;
    multipleSort?: IRecordSortLight[];
    version?: IRecordsQueryVersion[];
    pagination?: IRecordsQueryPagination;
    retrieveInactive?: boolean;
    searchQuery?: string;
}
