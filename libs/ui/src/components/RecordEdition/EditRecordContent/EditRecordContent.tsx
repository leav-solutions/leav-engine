// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FORM_ROOT_CONTAINER_ID, FormUIElementTypes, simpleStringHash} from '@leav/utils';
import {FunctionComponent, useEffect, useMemo, useState} from 'react';
import {ErrorDisplay} from '_ui/components';
import useGetRecordForm from '_ui/hooks/useGetRecordForm';
import {useGetRecordUpdatesSubscription} from '_ui/hooks/useGetRecordUpdatesSubscription';
import useRecordsConsultationHistory from '_ui/hooks/useRecordsConsultationHistory';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {IRecordIdentityWhoAmI} from '_ui/types/records';
import {FormElementTypes, RecordFormAttributeStandardAttributeFragment} from '_ui/_gqlTypes';
import {EditRecordReducerActionsTypes} from '../editRecordReducer/editRecordReducer';
import {useEditRecordReducer} from '../editRecordReducer/useEditRecordReducer';
import extractFormElements from './helpers/extractFormElements';
import {RecordEditionContext} from './hooks/useRecordEditionContext';
import {formComponents} from './uiElements';
import {DeleteMultipleValuesFunc, DeleteValueFunc, FormElement, IPendingValues, SubmitValueFunc} from './_types';
import {Form, FormInstance} from 'antd';
import {EDIT_OR_CREATE_RECORD_FORM_ID} from './formConstants';
import {getAntdFormInitialValues} from '_ui/components/RecordEdition/EditRecordContent/antdUtils';
import EditRecordSkeleton from '../EditRecordSkeleton';
import styled from 'styled-components';
import {useGetVisibleValues} from '_ui/components/RecordEdition/EditRecordContent/hooks/useGetVisibleValues';

interface IEditRecordContentProps {
    antdForm: FormInstance;
    formId?: string;
    formElementId?: string;
    record: IRecordIdentityWhoAmI | null;
    library: string;
    onRecordSubmit: (attributes: RecordFormAttributeStandardAttributeFragment[]) => void;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
    onDeleteMultipleValues: DeleteMultipleValuesFunc;
    readonly: boolean;
    pendingValues: IPendingValues;
}

const WrappedForm = styled(Form)`
    height: 100%;
`;

const EditRecordContent: FunctionComponent<IEditRecordContentProps> = ({
    antdForm,
    formId,
    formElementId,
    record,
    library,
    pendingValues,
    onRecordSubmit,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
    readonly
}) => {
    let formIdToLoad = formId;
    if (!formId) {
        formIdToLoad = record ? 'edition' : 'creation';
    }
    const {t} = useSharedTranslation();
    const {state, dispatch} = useEditRecordReducer();

    // Keep tabId displayed in reference to re-calculate visible elementIds and get its values
    const [tabIdVisible, setTabIdVisible] = useState<string>(null);
    const [recordComputedValues, setRecordComputedValues] = useState(null);

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

    const {
        loading,
        error,
        recordForm,
        refetch: refetchGetRecordForm
    } = useGetRecordForm({
        libraryId: library,
        recordId: record?.id,
        formId: formIdToLoad,
        version: state.valuesVersion
    });

    const {elementsValues, refetchComputeFields, recordFormWithValues} = useGetVisibleValues(
        formIdToLoad,
        recordForm,
        tabIdVisible
    );

    // Triggered when recordForm init
    useEffect(() => {
        // When we load the record form, get tab id visible
        // get id of the first tab
        const firstTabId = recordForm?.elements
            ?.find(e => e.uiElementType === 'tabs')
            ?.settings?.find(s => s.key === 'tabs')?.value[0]?.id;

        if (firstTabId) {
            setTabIdVisible(firstTabId);
        }
    }, [recordForm]);

    useEffect(() => {
        if (!record || !elementsValues?.length) {
            return;
        }

        // Transform elementsValues into the format expected by recordComputedValues
        const computedValuesMap = {};
        elementsValues.forEach(element => {
            if (element.attribute && element.values) {
                computedValuesMap[element.attribute.id] = element.values;
            }
        });

        setRecordComputedValues({
            [record.id]: computedValuesMap
        });
    }, [elementsValues, record]);

    useEffect(() => {
        if (!loading && recordForm) {
            dispatch({
                type: EditRecordReducerActionsTypes.INITIALIZE_SIDEBAR,
                enabled: recordForm.sidePanel.enable,
                isOpenByDefault: recordForm.sidePanel.isOpenByDefault
            });
        }
    }, [recordForm, loading]);

    const computeFieldsError = null;

    // Generate a hash of recordForm to detect changes
    const recordFormHash = useMemo(() => simpleStringHash(JSON.stringify(recordForm)), [recordForm]);

    useEffect(() => {
        if (state.refreshRequested) {
            refetchGetRecordForm();
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
            refetchComputeFields();
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
        values: null,
        uiElement: formComponents[FormUIElementTypes.FIELDS_CONTAINER]
    };

    const antdFormInitialValues = getAntdFormInitialValues(recordFormWithValues || recordForm);
    const computedValues = recordComputedValues && record ? recordComputedValues[record.id] : null;
    const elementsByContainer = extractFormElements(recordForm, computedValues, computeFieldsError);

    // Used to get different event from children elements (e.g., listen to onTabClick event from FormTab element)
    const onCustomEvent = (event: any): any => {
        // If a tab has been click
        // Re-calculate visible elements and fetch values
        if (event.eventName === 'onTabClick') {
            const tabIdClicked = event.tabIdClicked;
            setTabIdVisible(tabIdClicked);
        }
    };

    return (
        <WrappedForm
            id={formElementId ?? EDIT_OR_CREATE_RECORD_FORM_ID}
            form={antdForm}
            initialValues={antdFormInitialValues}
            onFinish={() =>
                onRecordSubmit(
                    recordForm.elements.filter(element => element.attribute?.id).map(element => element.attribute)
                )
            }
        >
            <RecordEditionContext.Provider
                value={{
                    elements: elementsByContainer,
                    readOnly: readonly,
                    record
                }}
            >
                <rootElement.uiElement
                    // Use a hash of a record form as a key to force a full re-render when the form changes
                    key={recordFormHash}
                    antdForm={antdForm}
                    formIdToLoad={formIdToLoad}
                    element={rootElement}
                    computedValues={computedValues}
                    readonly={readonly}
                    pendingValues={pendingValues}
                    onValueSubmit={_handleValueSubmit}
                    onValueDelete={_handleValueDelete}
                    onDeleteMultipleValues={onDeleteMultipleValues}
                    onCustomEvent={onCustomEvent}
                />
            </RecordEditionContext.Provider>
        </WrappedForm>
    );
};

export default EditRecordContent;
