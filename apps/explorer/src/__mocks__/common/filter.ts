// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordFilterCondition, RecordFilterOperator} from '_gqlTypes/globalTypes';
import {
    AttributeConditionFilter,
    FilterType,
    IFilter,
    IFilterAttribute,
    IFilterTree,
    IQueryFilter,
    TreeConditionFilter
} from '_types/types';
import {mockAttribute} from './attribute';

export const mockFilterAttribute: IFilterAttribute = {
    type: FilterType.ATTRIBUTE,
    index: 0,
    key: 'testId',
    value: {value: 'test-value'},
    active: true,
    condition: AttributeConditionFilter.CONTAINS,
    attribute: mockAttribute
};

export const mockFilterTree: IFilterTree = {
    type: FilterType.ATTRIBUTE,
    index: 0,
    key: 'testId',
    value: {value: 'test-value'},
    active: true,
    condition: TreeConditionFilter.CLASSIFIED_IN,
    tree: {id: 'treeId'}
};

export const mockQueryFilter: IQueryFilter = {
    field: 'field',
    value: 'value',
    condition: RecordFilterCondition.CONTAINS,
    operator: RecordFilterOperator.AND
};
