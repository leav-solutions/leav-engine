// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';
import {
    IProvidedByAntFormItem,
    ISubmitMultipleResult,
    StandardValueTypes
} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {CalculatedFlags, InheritedFlags} from '../calculatedInheritedFlags';

export interface IStandFieldValueContentProps<T> extends IProvidedByAntFormItem<T> {
    presentationValue?: string | string[];
    attribute?: RecordFormAttributeStandardAttributeFragment;
    label?: string;
    handleSubmit: (value: StandardValueTypes, id?: string) => Promise<void | ISubmitMultipleResult>;
    handleDeselect: (value: StandardValueTypes, id?: string) => Promise<void | ISubmitMultipleResult>;
    handleDeleteAllValues: () => Promise<void>;
    readonly: boolean;
    required: boolean;
    calculatedFlags: CalculatedFlags;
    inheritedFlags: InheritedFlags;
}
