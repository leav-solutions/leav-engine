// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorTypes} from '@leav/utils';
import {Errors} from '_types/errors';
import {ICursorPaginationParams, IPaginationParams} from '_types/list';
import {IRecord, IRecordFilterLight, IRecordSortLight} from '_types/record';
import {IValue, IValuesOptions, IValueVersion} from '_types/value';

export interface IFindRecordParams {
    library: string;
    filters?: IRecordFilterLight[];
    sort?: IRecordSortLight[];
    options?: IValuesOptions;
    pagination?: IPaginationParams | ICursorPaginationParams;
    withCount?: boolean;
    retrieveInactive?: boolean;
    fulltextSearch?: string;
}

export interface ICreateRecordParams {
    library: string;
    data?: {
        values: IValue[];
        version: IValueVersion;
    };
}

export interface ICreateRecordValueError {
    // Should correspond to GraphQL ValueBatchError
    attribute: string;
    type: ErrorTypes | Errors;
    message: string;
    input?: any;
}

export interface ICreateRecordResult {
    record?: IRecord;
    valuesErrors?: ICreateRecordValueError[];
}
