// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorTypes} from '@leav/utils';
import {ICursorPaginationParams, IPaginationParams} from '_types/list';
import {AttributeCondition, IRecord, Operator, TreeCondition} from '_types/record';
import {IValue, IValuesOptions, IValueVersion} from '_types/value';

export interface IRecordFilterLight {
    field?: string;
    value?: string;
    condition?: AttributeCondition | TreeCondition;
    operator?: Operator;
    treeId?: string;
}

export interface IRecordSortLight {
    field: string;
    order: string;
}

export interface IFindRecordParams {
    library: string;
    filters?: IRecordFilterLight[];
    sort?: IRecordSortLight;
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
    attributeId: string;
    type: ErrorTypes;
    message: string;
    id_value?: string;
    input?: any;
}

export interface ICreateRecordResult {
    record?: IRecord;
    valuesErrors?: ICreateRecordValueError[];
}
