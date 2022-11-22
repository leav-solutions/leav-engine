// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    AnyPrimitive,
    FormFieldTypes,
    FormUIElementTypes,
    ICommonFieldsSettings,
    IKeyValue,
    Override
} from '@leav/utils';
import {Checkbox, DatePicker, InputRef} from 'antd';
import {IRecordPropertyAttribute, RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {RecordFormElement} from 'hooks/useGetRecordForm/useGetRecordForm';
import {MutableRefObject} from 'react';
import {ValueInput} from '_gqlTypes/globalTypes';
import {RecordIdentity, RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {RECORD_FORM_recordForm_elements_attribute} from '_gqlTypes/RECORD_FORM';
import {
    SAVE_VALUE_BATCH_saveValueBatch_errors,
    SAVE_VALUE_BATCH_saveValueBatch_values
} from '_gqlTypes/SAVE_VALUE_BATCH';
import {IDateRangeValue, IRecordIdentityWhoAmI, ITreeNodeWithRecord, IValueVersion} from '_types/types';
import {IStandardFieldReducerState, IStandardFieldValue} from './reducers/standardFieldReducer/standardFieldReducer';

export interface IValueToSubmit {
    attribute: string;
    value: AnyPrimitive | null;
    idValue: string;
    metadata?: IKeyValue<AnyPrimitive>;
}

export enum APICallStatus {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    PARTIAL = 'PARTIAL'
}

export type FieldSubmitMultipleFunc = (
    record: RecordIdentity_whoAmI,
    values: IValueToSubmit[],
    version?: IValueVersion,
    deleteEmpty?: boolean
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
    record: IRecordIdentityWhoAmI;
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

export type SubmitValueFunc = (values: SubmittedValue[], version: IValueVersion) => Promise<ISubmitMultipleResult>;
export type DeleteValueFunc = (value: ValueInput | null, attribute: string) => Promise<IDeleteValueResult>;
export type DeleteMultipleValuesFunc = (
    attribute: string,
    values: RecordProperty[],
    version: IValueVersion
) => Promise<ISubmitMultipleResult>;

export type MetadataSubmitValueFunc = (
    value: RecordProperty,
    attribute: RECORD_FORM_recordForm_elements_attribute,
    metadata: IKeyValue<AnyPrimitive>
) => Promise<ISubmitMultipleResult>;

export interface ISubmittedValueBase {
    attribute: RECORD_FORM_recordForm_elements_attribute;
    idValue: string;
    metadata?: IKeyValue<AnyPrimitive>;
}

export interface IFormElementProps<SettingsType> {
    element: FormElement<SettingsType>;
    onValueSubmit?: SubmitValueFunc;
    onValueDelete?: DeleteValueFunc;
    onDeleteMultipleValues?: DeleteMultipleValuesFunc;
    metadataEdit?: boolean;
}

export type FormElement<SettingsType> = Override<
    RecordFormElement,
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

export type InputRefPossibleTypes = InputRef | typeof DatePicker | typeof Checkbox;

export type StandardValueTypes = AnyPrimitive | IDateRangeValue;

export enum FieldScope {
    INHERITED = 'INHERITED', // inherited values
    CURRENT = 'CURRENT' // values of "current" version, eg. the version selected in the form
}

export interface ICommonFieldsReducerState<ValuesType> {
    record: IRecordIdentityWhoAmI;
    formElement: FormElement<ICommonFieldsSettings>;
    attribute: IRecordPropertyAttribute;
    isReadOnly: boolean;
    activeScope: FieldScope;
    values: {
        [scope in FieldScope]: {
            version: IValueVersion;
            values: ValuesType;
        } | null;
    };
}
