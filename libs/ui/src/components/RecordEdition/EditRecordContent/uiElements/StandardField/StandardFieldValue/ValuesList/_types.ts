// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    RecordFormAttributeStandardAttributeFragment,
    StandardValuesListFragmentStandardDateRangeValuesListConfFragment,
    StandardValuesListFragmentStandardStringValuesListConfFragment
} from '_ui/_gqlTypes';
import {IProvidedByAntFormItem} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {
    IStandardFieldReducerState,
    IStandardFieldValue
} from '_ui/components/RecordEdition/EditRecordContent/reducers/standardFieldReducer/standardFieldReducer';
import {IEditRecordReducerActions} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {SelectProps} from 'antd';
import {Dispatch} from 'react';

export interface IMonoValueSelectProps extends IProvidedByAntFormItem<SelectProps> {
    state: IStandardFieldReducerState;
    editRecordDispatch: Dispatch<IEditRecordReducerActions>;
    attribute: RecordFormAttributeStandardAttributeFragment;
    fieldValue: IStandardFieldValue;
    handleSubmit: (value: string, id?: string) => void;
    handleBlur: () => void;
    shouldShowValueDetailsButton?: boolean;
}

export type IStringValuesListConf = StandardValuesListFragmentStandardStringValuesListConfFragment;
export type IDateRangeValuesListConf = StandardValuesListFragmentStandardDateRangeValuesListConfFragment;
