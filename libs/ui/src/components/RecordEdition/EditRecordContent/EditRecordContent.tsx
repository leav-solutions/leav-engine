// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FORM_ROOT_CONTAINER_ID, FormUIElementTypes, simpleStringHash} from '@leav/utils';
import {FunctionComponent, useEffect, useMemo} from 'react';
import {ErrorDisplay} from '_ui/components';
import useGetRecordForm from '_ui/hooks/useGetRecordForm';
import {useGetRecordUpdatesSubscription} from '_ui/hooks/useGetRecordUpdatesSubscription';
import useRecordsConsultationHistory from '_ui/hooks/useRecordsConsultationHistory';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IRecordIdentityWhoAmI} from '_ui/types/records';
import {FormElementTypes} from '_ui/_gqlTypes';
import {EditRecordReducerActionsTypes} from '../editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from '../editRecordReducer/useEditRecordReducer';
import extractFormElements from './helpers/extractFormElements';
import {RecordEditionContext} from './hooks/useRecordEditionContext';
import {formComponents} from './uiElements';
import {DeleteMultipleValuesFunc, DeleteValueFunc, FormElement, SubmitValueFunc} from './_types';
import {Form, FormInstance} from 'antd';
import {EDIT_OR_CREATE_RECORD_FORM_ID} from './formConstants';
import {getAntdFormInitialValues} from '_ui/components/RecordEdition/EditRecordContent/antdUtils';
import {useGetRecordValuesQuery} from '_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';
import EditRecordSkeleton from '../EditRecordSkeleton';

interface IEditRecordContentProps {
    antdForm: FormInstance;
    record: IRecordIdentityWhoAmI | null;
    library: string;
    onRecordSubmit: () => void;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
    onDeleteMultipleValues: DeleteMultipleValuesFunc;
    readonly: boolean;
}

const EditRecordContent: FunctionComponent<IEditRecordContentProps> = ({
    antdForm,
    record,
    library,
    onRecordSubmit,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
    readonly
}) => {
    const formId = record ? 'edition' : 'creation';
    const {t} = useSharedTranslation();
    const {state, dispatch} = useEditRecordReducer();

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

    const {
        data: computeFieldsData,
        error: computeFieldsError,
        refetch: refetchComputeFields
    } = useGetRecordValuesQuery(
        library,
        recordForm
            ? recordForm.elements.filter(element => element.attribute?.compute).map(element => element.attribute.id)
            : [],
        [record?.id]
    );

    // Generate a hash of recordForm to detect changes
    const recordFormHash = useMemo(() => simpleStringHash(JSON.stringify(recordForm)), [recordForm]);

    useEffect(() => {
        if (state.refreshRequested) {
            refetch();
            dispatch({type: EditRecordReducerActionsTypes.REFRESH_DONE});
        }
    }, [state.refreshRequested]);

    if (loading && !recordForm) {
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

        const isEditing = Boolean(record);
        if (isEditing) {
            refetchComputeFields([record.id]);
        }

        return submitRes;
    };

    const _handleValueDelete: DeleteValueFunc = async (value, attribute) => {
        const deleteRes = await onValueDelete(value, attribute);

        _checkDependencyChange(attribute);

        return deleteRes;
    };

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

    const antdFormInitialValues = getAntdFormInitialValues(recordForm);
    const recordComputedValues = computeFieldsData && record ? computeFieldsData[record.id] : null;
    const elementsByContainer = extractFormElements(recordForm, recordComputedValues, computeFieldsError);

    return (
        <Form
            id={EDIT_OR_CREATE_RECORD_FORM_ID}
            form={antdForm}
            initialValues={antdFormInitialValues}
            onFinish={onRecordSubmit}
        >
            <RecordEditionContext.Provider
                value={{
                    elements: elementsByContainer,
                    readOnly: readonly,
                    record
                }}
            >
                <rootElement.uiElement
                    // Use a hash of record form as a key to force a full re-render when the form changes
                    key={recordFormHash}
                    antdForm={antdForm}
                    element={rootElement}
                    computedValues={recordComputedValues}
                    readonly={readonly}
                    onValueSubmit={_handleValueSubmit}
                    onValueDelete={_handleValueDelete}
                    onDeleteMultipleValues={onDeleteMultipleValues}
                />
            </RecordEditionContext.Provider>
        </Form>
    );
};

export default EditRecordContent;
