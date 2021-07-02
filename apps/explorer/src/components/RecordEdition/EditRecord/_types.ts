// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AnyPrimitive, FormFieldTypes, FormUIElementTypes, ICommonFieldsSettings} from '@leav/utils';
import {RecordProperty} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {GET_FORM_forms_list_elements_elements} from '_gqlTypes/GET_FORM';
import {SAVE_VALUE_saveValue} from '_gqlTypes/SAVE_VALUE';
import {
    SAVE_VALUE_BATCH_saveValueBatch_errors,
    SAVE_VALUE_BATCH_saveValueBatch_values
} from '_gqlTypes/SAVE_VALUE_BATCH';
import {Override} from '_types/Override';
import {IRecordIdentityWhoAmI} from '_types/types';
import {
    IStandardFieldReducerState,
    IStandardFieldValue
} from './uiElements/StandardField/standardFieldReducer/standardFieldReducer';

export interface IValueToSubmit {
    value: AnyPrimitive | null;
    idValue: string;
}

export enum APICallStatus {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

export type FieldSubmitFunc = (value: IValueToSubmit) => Promise<ISubmitResult>;
export interface ISubmitResult {
    status: APICallStatus;
    value?: SAVE_VALUE_saveValue;
    error?: string;
}

export type FieldSubmitMultipleFunc = (values: IValueToSubmit[]) => Promise<ISubmitMultipleResult>;
export interface ISubmitMultipleResult {
    status: APICallStatus;
    error?: string;
    values?: SAVE_VALUE_BATCH_saveValueBatch_values[];
    errors?: SAVE_VALUE_BATCH_saveValueBatch_errors[];
}

export type DeleteValueFunc = (valueId?: string) => Promise<IDeleteValueResult>;
export interface IDeleteValueResult {
    status: APICallStatus;
    error?: string;
}

export interface IFormElementsByContainer {
    [containerId: string]: Array<FormElement<unknown>>;
}

export interface IFormElementProps<SettingsType> {
    record: IRecordIdentityWhoAmI;
    element: FormElement<SettingsType>;
    recordValues: Record<string, RecordProperty[]>;
}

export type FormElement<SettingsType> = Override<
    GET_FORM_forms_list_elements_elements,
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
    onSubmit: (valueToSave: AnyPrimitive) => void;
    settings: ICommonFieldsSettings;
}
