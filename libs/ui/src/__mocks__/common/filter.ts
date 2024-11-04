// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    AttributeConditionFilter,
    FilterType,
    IFilterAttribute,
    IFilterTree,
    IQueryFilter,
    TreeConditionFilter
} from '_ui/types/search';
import {RecordFilterCondition, RecordFilterOperator} from '_ui/_gqlTypes';
import {mockAttributeWithDetails} from './attribute';
import {mockLibrarySimple} from './library';

export const mockFilterAttribute: IFilterAttribute = {
    type: FilterType.ATTRIBUTE,
    index: 0,
    key: 'testId',
    value: {value: 'test-value'},
    active: true,
    condition: AttributeConditionFilter.CONTAINS,
    attribute: {...mockAttributeWithDetails, isLink: false, isMultiple: false, library: mockLibrarySimple.id}
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
