import {type FunctionComponent, useEffect, useMemo} from 'react';
import {FORM_ROOT_CONTAINER_ID, FormUIElementTypes} from '@leav/utils';
import {Form, type FormInstance} from 'antd';
import styled from 'styled-components';
import {ErrorDisplay} from '_ui/components';
import useGetRecordForm from '_ui/hooks/useGetRecordForm';
import {useGetRecordUpdatesSubscription} from '_ui/hooks/useGetRecordUpdatesSubscription';
import useRecordsConsultationHistory from '_ui/hooks/useRecordsConsultationHistory';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type IRecordIdentityWhoAmI} from '_ui/types/records';
import {FormElementTypes, type RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';
import {EditRecordReducerActionsTypes} from '../editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from '../editRecordReducer/useEditRecordReducer';
import extractFormElements from './helpers/extractFormElements';
import {RecordEditionContext} from './hooks/useRecordEditionContext';
import {formComponents} from './uiElements';
import {type DeleteMultipleValuesFunc, type DeleteValueFunc, type FormElement, type SubmitValueFunc} from './_types';
import {EDIT_OR_CREATE_RECORD_FORM_ID} from './formConstants';
import {getAntdFormInitialValues} from '_ui/components/RecordEdition/EditRecordContent/antdUtils';
import {useGetRecordValuesQuery} from '_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';
import EditRecordSkeleton from '../EditRecordSkeleton';

interface IEditRecordContentProps {
    antdForm: FormInstance;
    formId?: string;
    isFormCreationMode: boolean;
    formElementId?: string;
    record: IRecordIdentityWhoAmI | null;
    library: string;
    onRecordSubmit: (attributes: RecordFormAttributeStandardAttributeFragment[]) => void;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
    onDeleteMultipleValues: DeleteMultipleValuesFunc;
    readonly: boolean;
}

const WrappedForm = styled(Form)`
    height: 100%;
`;

const EditRecordContent: FunctionComponent<IEditRecordContentProps> = ({
    antdForm,
    formId,
    isFormCreationMode,
    formElementId,
    record,
    library,
    onRecordSubmit,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
    readonly,
}) => {
    const {t} = useSharedTranslation();
    const {state, dispatch} = useEditRecordReducer();

    useRecordsConsultationHistory(record?.library?.id ?? null, record?.id ?? null);

    const {data: recordUpdateData} = useGetRecordUpdatesSubscription(
        {records: [record?.id], ignoreOwnEvents: true},
        !record?.id,
    );

    useEffect(() => {
        if (recordUpdateData) {
            dispatch({
                type: EditRecordReducerActionsTypes.ADD_EXTERNAL_UPDATE,
                modifier: recordUpdateData?.recordUpdate?.record?.modified_by?.[0]?.value?.whoAmI,
                updatedValues: recordUpdateData?.recordUpdate?.updatedValues,
            });
        }
    }, [recordUpdateData]);

    const {loading, error, recordForm, refetch} = useGetRecordForm({
        libraryId: library,
        recordId: record?.id,
        formId,
        version: state.valuesVersion,
    });

    useEffect(() => {
        if (!loading && recordForm) {
            dispatch({
                type: EditRecordReducerActionsTypes.INITIALIZE_SIDEBAR,
                enabled: recordForm.sidePanel.enable,
                isOpenByDefault: recordForm.sidePanel.isOpenByDefault,
            });
        }
    }, [recordForm, loading]);

    const computeAttributeIds = useMemo(
        () =>
            recordForm
                ? recordForm.elements.filter(element => element.attribute?.compute).map(element => element.attribute.id)
                : [],
        [recordForm],
    );

    const {
        data: computeFieldsData,
        error: computeFieldsError,
        refetch: refetchComputeFields,
    } = useGetRecordValuesQuery(library, computeAttributeIds, [record?.id], true);

    useEffect(() => {
        if (state.refreshRequested) {
            refetch().then(() => {
                dispatch({type: EditRecordReducerActionsTypes.REFRESH_DONE});
            });
        }
    }, [state.refreshRequested]);

    if (loading && !recordForm) {
        return <EditRecordSkeleton rows={5} />;
    }

    if (error) {
        const message =
            Object.values((error.graphQLErrors[0]?.extensions?.exception as {fields: string})?.fields ?? {}).join(
                '\n',
            ) ?? error?.message;

        return <ErrorDisplay message={message ?? t('record_edition.no_form_error')} />;
    }

    /**
     * If a dependency attribute has changed, we need to refresh the form.
     * @param changedAttribute - string
     */
    const _checkDependencyChange = (changedAttribute: string) => {
        if (recordForm.dependencyAttributes.map(depAttribute => depAttribute.id).includes(changedAttribute)) {
            dispatch({type: EditRecordReducerActionsTypes.REQUEST_REFRESH});
        }
    };

    const _handleValueSubmit: SubmitValueFunc = async (element, value) => {
        const submitRes = await onValueSubmit(element, value);

        _checkDependencyChange(element[0].attribute.id);

        // No compute attribute on this form: skip the round-trip entirely instead of refetching an
        // empty column list.
        if (computeAttributeIds.length > 0) {
            await refetchComputeFields([record.id]);
        }

        return submitRes;
    };

    const _handleValueDelete: DeleteValueFunc = async (value, attribute) => {
        const deleteRes = await onValueDelete(value, attribute);

        _checkDependencyChange(attribute);

        return deleteRes;
    };

    const rootElement: FormElement<unknown> = {
        id: FORM_ROOT_CONTAINER_ID,
        containerId: null,
        type: FormElementTypes.layout,
        uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
        settings: {},
        attribute: null,
        valueError: null,
        values: null,
        uiElement: formComponents[FormUIElementTypes.FIELDS_CONTAINER],
    };
    const antdFormInitialValues = getAntdFormInitialValues(recordForm);
    const recordComputedValues = computeFieldsData && record ? computeFieldsData[record.id] : null;
    const elementsByContainer = extractFormElements(recordForm, recordComputedValues, computeFieldsError);

    return (
        <WrappedForm
            id={formElementId ?? EDIT_OR_CREATE_RECORD_FORM_ID}
            form={antdForm}
            initialValues={antdFormInitialValues}
            onFinish={() =>
                onRecordSubmit(
                    recordForm.elements.filter(element => element.attribute?.id).map(element => element.attribute),
                )
            }
        >
            <RecordEditionContext.Provider
                value={{
                    elements: elementsByContainer,
                    readOnly: readonly,
                    record,
                }}
            >
                <rootElement.uiElement
                    isFormCreationMode={isFormCreationMode}
                    antdForm={antdForm}
                    element={rootElement}
                    computedValues={recordComputedValues}
                    readonly={readonly}
                    onValueSubmit={_handleValueSubmit}
                    onValueDelete={_handleValueDelete}
                    onDeleteMultipleValues={onDeleteMultipleValues}
                />
            </RecordEditionContext.Provider>
        </WrappedForm>
    );
};

export default EditRecordContent;
