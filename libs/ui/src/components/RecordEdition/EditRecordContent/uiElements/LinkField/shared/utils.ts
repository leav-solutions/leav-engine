// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat, AttributeType, RecordFilterCondition} from '_ui/_gqlTypes';
import {IExplorerFilterStandard} from '_ui/components/Explorer/_types';

export const FILTER_ON_ID_DEFAULT_FIELDS: Omit<IExplorerFilterStandard, 'value'> = {
    id: '',
    attribute: {
        format: AttributeFormat.text,
        label: 'id',
        type: AttributeType.simple
    },
    field: 'id',
    condition: RecordFilterCondition.EQUAL
};

export const NO_RECORD_FILTERS: IExplorerFilterStandard[] = [
    {
        ...FILTER_ON_ID_DEFAULT_FIELDS,
        value: 'NO_RECORD'
    }
];

export const ACTION_ITEM_EMPTY_LABEL = '';
