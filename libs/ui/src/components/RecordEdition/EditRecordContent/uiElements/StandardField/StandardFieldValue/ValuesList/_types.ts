// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    RecordFormAttributeStandardAttributeFragment,
    StandardValuesListFragmentStandardDateRangeValuesListConfFragment,
    StandardValuesListFragmentStandardStringValuesListConfFragment
} from '_ui/_gqlTypes';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {IStandardFieldReducerState} from '_ui/components/RecordEdition/EditRecordContent/reducers/standardFieldReducer/standardFieldReducer';
import {SelectProps} from 'antd';

export interface IMonoValueSelectProps extends IProvidedByAntFormItem<SelectProps> {
    presentationValue: string;
    state: IStandardFieldReducerState;
    attribute: RecordFormAttributeStandardAttributeFragment;
    handleSubmit: (value: string, id?: string) => Promise<void>;
}

export type IStringValuesListConf = StandardValuesListFragmentStandardStringValuesListConfFragment;
export type IDateRangeValuesListConf = StandardValuesListFragmentStandardDateRangeValuesListConfFragment;
