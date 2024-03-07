// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormUIElementTypes, FORM_ROOT_CONTAINER_ID, simpleStringHash, IDateRangeValue} from '@leav/utils';
import {useEffect, useMemo} from 'react';
import {ErrorDisplay} from '_ui/components';
import useGetRecordForm, {
    RecordFormElementsValue,
    RecordFormElementsValueStandardValue
} from '_ui/hooks/useGetRecordForm';
import {useGetRecordUpdatesSubscription} from '_ui/hooks/useGetRecordUpdatesSubscription';
import useRecordsConsultationHistory from '_ui/hooks/useRecordsConsultationHistory';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IRecordIdentityWhoAmI} from '_ui/types/records';
import {AttributeFormat, FormElementTypes} from '_ui/_gqlTypes';
import {EditRecordReducerActionsTypes} from '../editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from '../editRecordReducer/useEditRecordReducer';
import EditRecordSkeleton from './EditRecordSkeleton';
import extractFormElements from './helpers/extractFormElements';
import {RecordEditionContext} from './hooks/useRecordEditionContext';
import {formComponents} from './uiElements';
import {DeleteMultipleValuesFunc, DeleteValueFunc, FormElement, SubmitValueFunc} from './_types';
import {Form} from 'antd';
import {useForm} from 'antd/es/form/Form';
import dayjs from 'dayjs';

interface IEditRecordContentProps {
    record: IRecordIdentityWhoAmI | null;
    library: string;
    handleRecordSubmit: () => void;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
    onDeleteMultipleValues: DeleteMultipleValuesFunc;
    readonly: boolean;
}

function EditRecordContent({
    record,
    library,
    handleRecordSubmit,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
    readonly
}: IEditRecordContentProps): JSX.Element {
    const formId = record ? 'edition' : 'creation';
    const {t} = useSharedTranslation();
    const {state, dispatch} = useEditRecordReducer();
    const [antForm] = useForm();

    useRecordsConsultationHistory(record?.library?.id ?? null, record?.id ?? null);

    const {data: recordUpdateData} = useGetRecordUpdatesSubscription(
        {records: [record?.id], ignoreOwnEvents: true},
        !record?.id
    );

    useEffect(() => {
        if (recordUpdateData) {
            dispatch({
                type: EditRecordReducerActionsTypes.ADD_EXTERNAL_UPDATE,
                modifier: recordUpdateData?.recordUpdate?.record?.modified_by?.[0]?.value?.whoAmI,
                updatedValues: recordUpdateData?.recordUpdate?.updatedValues
            });
        }
    }, [recordUpdateData]);

    const {loading, error, recordForm, refetch} = useGetRecordForm({
        libraryId: library,
        recordId: record?.id,
        formId,
        version: state.valuesVersion
    });

    // Generate a hash of recordForm to detect changes
    const recordFormHash = useMemo(() => simpleStringHash(JSON.stringify(recordForm)), [recordForm]);

    useEffect(() => {
        if (state.refreshRequested) {
            refetch();
            dispatch({type: EditRecordReducerActionsTypes.REFRESH_DONE});
        }
    }, [state.refreshRequested]);

    if (loading) {
        return <EditRecordSkeleton rows={5} />;
    }

    if (error) {
        const message =
            Object.values((error.graphQLErrors[0]?.extensions?.exception as {fields: string})?.fields ?? {}).join(
                '\n'
            ) ?? error?.message;

        return <ErrorDisplay message={message ?? t('record_edition.no_form_error')} />;
    }

    const _checkDependencyChange = (changedAttribute: string) => {
        // If a dependency attribute has changed, we need to refresh the form
        if (recordForm.dependencyAttributes.map(depAttribute => depAttribute.id).includes(changedAttribute)) {
            dispatch({type: EditRecordReducerActionsTypes.REQUEST_REFRESH});
        }
    };

    const _handleValueSubmit: SubmitValueFunc = async (element, value) => {
        const submitRes = await onValueSubmit(element, value);

        _checkDependencyChange(element[0].attribute.id);

        return submitRes;
    };

    const _handleValueDelete: DeleteValueFunc = async (value, attribute) => {
        const deleteRes = await onValueDelete(value, attribute);

        _checkDependencyChange(attribute);

        return deleteRes;
    };

    const elementsByContainer = extractFormElements(recordForm);

    const rootElement: FormElement<{}> = {
        id: FORM_ROOT_CONTAINER_ID,
        containerId: null,
        type: FormElementTypes.layout,
        uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
        settings: {},
        attribute: null,
        valueError: null,
        values: null,
        uiElement: formComponents[FormUIElementTypes.FIELDS_CONTAINER]
    };

    const antdFormInitialValues = {};
    recordForm.elements.forEach(element => {
        const {attribute, values} = element;
        const fieldValue = values[0] as RecordFormElementsValueStandardValue;
        if (attribute.format === AttributeFormat.text) {
            antdFormInitialValues[attribute.id] = fieldValue?.raw_value || '';
        }

        const hasDateRangeValues = (dateRange: unknown): dateRange is IDateRangeValue => {
            return (dateRange as IDateRangeValue).from !== undefined;
        };

        if (attribute.format === AttributeFormat.date_range) {
            if (fieldValue?.raw_value) {
                if (hasDateRangeValues(fieldValue.raw_value)) {
                    antdFormInitialValues[attribute.id] = [
                        dayjs.unix(Number(fieldValue.raw_value.from)),
                        dayjs.unix(Number(fieldValue.raw_value.to))
                    ];
                } else if (typeof fieldValue.raw_value === 'string') {
                    const convertedFieldValue = JSON.parse(fieldValue.raw_value);
                    antdFormInitialValues[attribute.id] = [
                        dayjs.unix(Number(convertedFieldValue.from)),
                        dayjs.unix(Number(convertedFieldValue.to))
                    ];
                }
            }
        }
    });

    // Use a hash of record form as a key to force a full re-render when the form changes
    return (
        <Form form={antForm} initialValues={antdFormInitialValues} onFinish={handleRecordSubmit}>
            <RecordEditionContext.Provider value={{elements: elementsByContainer, readOnly: readonly, record}}>
                <rootElement.uiElement
                    key={recordFormHash}
                    element={rootElement}
                    onValueSubmit={_handleValueSubmit}
                    onValueDelete={_handleValueDelete}
                    onDeleteMultipleValues={onDeleteMultipleValues}
                />
            </RecordEditionContext.Provider>
        </Form>
    );
}

export default EditRecordContent;
