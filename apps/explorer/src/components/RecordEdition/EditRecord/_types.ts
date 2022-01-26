// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive, FormFieldTypes, FormUIElementTypes, ICommonFieldsSettings, Override} from '@leav/utils';
import {Checkbox, DatePicker, Input} from 'antd';
import {ITreeNodeWithRecord} from 'components/shared/SelectTreeNodeModal/SelectTreeNodeModal';
import {MutableRefObject} from 'react';
import {RecordIdentity, RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {RECORD_FORM_recordForm_elements, RECORD_FORM_recordForm_elements_attribute} from '_gqlTypes/RECORD_FORM';
import {
    SAVE_VALUE_BATCH_saveValueBatch_errors,
    SAVE_VALUE_BATCH_saveValueBatch_values
} from '_gqlTypes/SAVE_VALUE_BATCH';
import {IDateRangeValue, IRecordIdentityWhoAmI} from '_types/types';
import {
    IStandardFieldReducerState,
    IStandardFieldValue
} from './uiElements/StandardField/standardFieldReducer/standardFieldReducer';

export interface IValueToSubmit {
    attribute: string;
    value: AnyPrimitive | null;
    idValue: string;
}

export enum APICallStatus {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    PARTIAL = 'PARTIAL'
}

export type FieldSubmitMultipleFunc = (
    record: RecordIdentity_whoAmI,
    values: IValueToSubmit[]
) => Promise<ISubmitMultipleResult>;
export interface ISubmitMultipleResult {
    status: APICallStatus;
    error?: string;
    values?: SAVE_VALUE_BATCH_saveValueBatch_values[];
    errors?: SAVE_VALUE_BATCH_saveValueBatch_errors[];
}

export interface IDeleteValueResult {
    status: APICallStatus;
    error?: string;
}

export interface IRecordEditionContext {
    elements: IFormElementsByContainer;
    readOnly: boolean;
}

export interface IFormElementsByContainer {
    [containerId: string]: Array<FormElement<unknown>>;
}

export interface ISubmittedValueStandard extends ISubmittedValueBase {
    value: AnyPrimitive;
}

export interface ISubmittedValueLink extends ISubmittedValueBase {
    value: RecordIdentity;
}

export interface ISubmittedValueTree extends ISubmittedValueBase {
    value: ITreeNodeWithRecord;
}

export type SubmittedValue = ISubmittedValueStandard | ISubmittedValueLink | ISubmittedValueTree;

export type SubmitValueFunc = (values: SubmittedValue[]) => Promise<ISubmitMultipleResult>;
export type DeleteValueFunc = (idValue: string | null, attribute: string) => Promise<IDeleteValueResult>;

export interface ISubmittedValueBase {
    attribute: RECORD_FORM_recordForm_elements_attribute;
    idValue: string;
}

export interface IFormElementProps<SettingsType> {
    record: IRecordIdentityWhoAmI;
    element: FormElement<SettingsType>;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
}

export type FormElement<SettingsType> = Override<
    RECORD_FORM_recordForm_elements,
    {
        settings: SettingsType;
        uiElementType: FormUIElementTypes | FormFieldTypes;
    }
> & {
    uiElement: (props: IFormElementProps<unknown>) => JSX.Element;
};

export interface IDependencyValues {
    [attributeId: string]: Array<{id: string; library: string}>;
}

export interface IStandardInputProps {
    state: IStandardFieldReducerState;
    fieldValue: IStandardFieldValue;
    onFocus: () => void;
    onChange: (value: string) => void;
    onSubmit: (valueToSave: StandardValueTypes) => void;
    onPressEnter?: () => void;
    settings: ICommonFieldsSettings;
    inputRef: MutableRefObject<InputRefPossibleTypes>;
}

export type InputRefPossibleTypes = Input | typeof DatePicker | typeof Checkbox;

export type StandardValueTypes = AnyPrimitive | IDateRangeValue;
