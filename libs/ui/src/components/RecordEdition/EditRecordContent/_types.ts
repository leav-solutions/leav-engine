// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    AnyPrimitive,
    FormFieldTypes,
    FormUIElementTypes,
    IRequiredFieldsSettings,
    IKeyValue,
    Override
} from '@leav/utils';
import {RecordFormElementsValue} from '_ui/hooks/useGetRecordForm';
import {IRecordIdentity, IRecordIdentityWhoAmI} from '_ui/types/records';
import {ITreeNodeWithRecord} from '_ui/types/trees';
import {IValueVersion} from '_ui/types/values';
import {
    RecordFormAttributeFragment,
    SaveValueBatchMutation,
    CreateRecordMutation,
    RecordIdentityFragment,
    ValueBatchInput,
    ValueDetailsFragment,
    ValueInput
} from '_ui/_gqlTypes';
import {RecordProperty} from '_ui/_queries/records/getRecordPropertiesQuery';
import {RecordFormElementFragment} from '../../../_gqlTypes';
import {FormInstance} from 'antd/lib/form/Form';
import {GetRecordColumnsValuesRecord} from '_ui/_queries/records/getRecordColumnsValues';

export interface IValueToSubmit {
    attribute: string;
    value: AnyPrimitive | null;
    idValue: string | null;
    metadata?: IKeyValue<AnyPrimitive>;
}

export enum APICallStatus {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    PARTIAL = 'PARTIAL'
}

export type FieldSubmitMultipleFunc = (
    record: IRecordIdentityWhoAmI,
    values: IValueToSubmit[],
    version?: IValueVersion,
    deleteEmpty?: boolean
) => Promise<ISubmitMultipleResult>;

export interface ISubmitMultipleResult {
    status: APICallStatus;
    error?: string;
    values?: ValueDetailsFragment[];
    errors?: SaveValueBatchMutation['saveValueBatch']['errors'];
}

export interface IDeleteValueResult {
    status: APICallStatus;
    error?: string;
}

export interface ICreateRecordResult {
    status: APICallStatus;
    record?: RecordIdentityFragment['whoAmI'];
    errors?: CreateRecordMutation['createRecord']['valuesErrors'];
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
    value: IRecordIdentity;
}

export interface ISubmittedValueTree extends ISubmittedValueBase {
    value: ITreeNodeWithRecord;
}

export type SubmittedValue = ISubmittedValueStandard | ISubmittedValueLink | ISubmittedValueTree;

export type SubmitValueFunc = (values: SubmittedValue[], version: IValueVersion) => Promise<ISubmitMultipleResult>;
export type DeleteValueFunc = (value: ValueInput | null, attribute: string) => Promise<IDeleteValueResult>;
export type CreateRecordFunc = (library: string, values: ValueBatchInput[]) => Promise<ICreateRecordResult>;
export type DeleteMultipleValuesFunc = (
    attribute: string,
    values: RecordProperty[],
    version: IValueVersion
) => Promise<ISubmitMultipleResult>;

export type MetadataSubmitValueFunc = (
    value: RecordProperty,
    attribute: RecordFormAttributeFragment,
    metadata: IKeyValue<AnyPrimitive>
) => Promise<ISubmitMultipleResult>;

export interface ISubmittedValueBase {
    attribute: RecordFormAttributeFragment;
    idValue: string;
    metadata?: IKeyValue<AnyPrimitive>;
}

export interface IFormElementProps<SettingsType, RecordFormElements = RecordFormElementsValue> {
    element: FormElement<SettingsType, RecordFormElements>;
    formIdToLoad: string | 'edition' | 'creation';
    pendingValues?: IPendingValues;
    readonly?: boolean;
    onValueSubmit?: SubmitValueFunc;
    onValueDelete?: DeleteValueFunc;
    onDeleteMultipleValues?: DeleteMultipleValuesFunc;
    metadataEdit?: boolean;
}

export type FormElement<SettingsType, RecordFormElements = RecordFormElementsValue> = Override<
    RecordFormElementFragment,
    {
        settings: SettingsType;
        uiElementType: FormUIElementTypes | FormFieldTypes;
        values: RecordFormElements[];
    }
> & {
    uiElement: (
        props: IFormElementProps<unknown> & {
            antdForm?: FormInstance;
            computedValues?: GetRecordColumnsValuesRecord;
        }
    ) => JSX.Element;
};

export interface IDependencyValues {
    [attributeId: string]: Array<{id: string; library: string}>;
}

export type StandardValueTypes = AnyPrimitive;

export enum VersionFieldScope {
    INHERITED = 'INHERITED', // inherited values
    CURRENT = 'CURRENT' // values of "current" version, eg. the version selected in the form
}

export interface ICommonFieldsReducerState<ValuesType, RecordFormAttributeFragmentType = RecordFormAttributeFragment> {
    record: IRecordIdentityWhoAmI;
    formElement: FormElement<IRequiredFieldsSettings>;
    attribute: RecordFormAttributeFragmentType;
    isReadOnly: boolean;
    activeScope: VersionFieldScope;
    values: {
        [scope in VersionFieldScope]: {
            version: IValueVersion;
            values: ValuesType;
        } | null;
    };
}

export interface IProvidedByAntFormItem<
    InputFieldProps extends {value?: unknown; onChange?: unknown},
    AntNotifier extends {onChange?: unknown} = InputFieldProps
> {
    value?: InputFieldProps['value'];
    onChange?: AntNotifier['onChange'];
}

export type IPendingValues = Record<string, {[idValue: string]: ValueDetailsFragment}>;
