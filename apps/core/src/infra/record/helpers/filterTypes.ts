// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeCondition, IRecordFilterOption, TreeCondition} from '../../../_types/record';

export interface IFilterTypesHelper {
    isAttributeFilter(filter: IRecordFilterOption): boolean;
    isClassifyingFilter(filter: IRecordFilterOption): boolean;
    isCountFilter(filter: IRecordFilterOption): boolean;
}

export default function (): IFilterTypesHelper {
    const _isAttributeFilter = (filter: IRecordFilterOption) =>
        (filter as IRecordFilterOption).condition in AttributeCondition;

    const _isClassifyingFilter = (filter: IRecordFilterOption) =>
        (filter as IRecordFilterOption).condition in TreeCondition;

    const _isCountFilter = (filter: IRecordFilterOption) =>
        [
            AttributeCondition.VALUES_COUNT_EQUAL,
            AttributeCondition.VALUES_COUNT_GREATER_THAN,
            AttributeCondition.VALUES_COUNT_LOWER_THAN,
            AttributeCondition.IS_EMPTY,
            AttributeCondition.IS_NOT_EMPTY
        ].includes(filter.condition as AttributeCondition);

    return {
        isAttributeFilter: _isAttributeFilter,
        isClassifyingFilter: _isClassifyingFilter,
        isCountFilter: _isCountFilter
    };
}
