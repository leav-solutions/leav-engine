// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';
import {IProvidedByAntFormItem, StandardValueTypes} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {IStandardFieldReducerState} from '_ui/components/RecordEdition/EditRecordContent/reducers/standardFieldReducer/standardFieldReducer';

export interface IStandFieldValueContentProps<T> extends IProvidedByAntFormItem<T> {
    presentationValue?: string;
    state: IStandardFieldReducerState;
    attribute?: RecordFormAttributeStandardAttributeFragment;
    handleSubmit: (value: StandardValueTypes, id?: string) => Promise<void>;
}
