// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordFilterCondition, RecordFilterOperator} from '_gqlTypes/globalTypes';
import {AttributeConditionFilter, IFilter, IQueryFilter} from '_types/types';
import {mockAttribute} from './attribute';

export const mockFilter: IFilter = {
    index: 0,
    key: 'testId',
    value: {value: 'test-value'},
    active: true,
    condition: AttributeConditionFilter.CONTAINS,
    attribute: mockAttribute
};

export const mockQueryFilter: IQueryFilter = {
    field: 'field',
    value: 'value',
    condition: RecordFilterCondition.CONTAINS,
    operator: RecordFilterOperator.AND
};
