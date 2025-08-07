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
import {formComponents} from './uiElements';
import {
    DeleteMultipleValuesFunc,
    DeleteValueFunc,
    FormElement,
    ICustomEventResult,
    IPendingValues,
    SubmitValueFunc
} from './_types';
import {Form, FormInstance} from 'antd';
import {EDIT_OR_CREATE_RECORD_FORM_ID} from './formConstants';
import EditRecordSkeleton from '../EditRecordSkeleton';
import styled from 'styled-components';
import {useFetchVisibleFormValue} from '_ui/components/RecordEdition/EditRecordContent/hooks/useFetchVisibleFormValue';
import extractFormElements from '_ui/components/RecordEdition/EditRecordContent/helpers/extractFormElements';
import useTabManagement from '_ui/components/RecordEdition/EditRecordContent/hooks/useTabManagement';

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

    // Reformat values with key as attribute id to facilitate the usage in form (attribute id as reference)
    const [valuesMappedByAttributeId, setValuesMappedByAttributeId] = useState(null);

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

    // Get form without values
    const {loading, error, recordForm} = useGetRecordForm({
        libraryId: library,
        recordId: record?.id,
        formId: formIdToLoad,
        version: state.valuesVersion
    });

    // Keep tabId displayed in reference to re-calculate visible elementIds and get its values
    const {tabIdVisible, handleTabClick} = useTabManagement(recordForm?.elements);

    // Get values of formElements
    const {
        loading: loadingValues,
        refetchRecordFormWithValues,
        recordFormWithValues,
        error: errorOnGetValues
    } = useFetchVisibleFormValue(formIdToLoad, recordForm, tabIdVisible);

    useEffect(() => {
        if (!recordFormWithValues?.recordId || !recordFormWithValues?.elements?.length) {
            return;
        }
        // Transform elementsValues into the format by attribute id
        const valuesMappedByAttributeIdTmp = {};
        recordFormWithValues.elements.forEach(element => {
            if (element.attribute && element.values) {
                valuesMappedByAttributeIdTmp[element.attribute.id] = element.values;
            }
        });

        setValuesMappedByAttributeId(valuesMappedByAttributeIdTmp);
    }, [recordFormWithValues]);

    useEffect(() => {
        if (!loading && recordForm) {
            dispatch({
                type: EditRecordReducerActionsTypes.INITIALIZE_SIDEBAR,
                enabled: recordForm.sidePanel.enable,
                isOpenByDefault: recordForm.sidePanel.isOpenByDefault
            });
        }
    }, [recordForm, loading]);

    // Generate a hash of recordForm to detect changes
    const recordFormHash = useMemo(() => simpleStringHash(JSON.stringify(recordForm)), [recordForm]);

    useEffect(() => {
        if (state.refreshRequested) {
            refetchRecordFormWithValues();
            dispatch({type: EditRecordReducerActionsTypes.REFRESH_DONE});
        }
    }, [state.refreshRequested]);

    if ((loading && !recordForm) || loadingValues) {
        return <EditRecordSkeleton rows={5} />;
    }

    const displayError = e => {
        const message =
            Object.values((e.graphQLErrors[0]?.extensions?.exception as {fields: string})?.fields ?? {}).join('\n') ??
            error?.message;

        return <ErrorDisplay message={message ?? t('record_edition.no_form_error')} />;
    };

    if (error) {
        return displayError(error);
    } else if (errorOnGetValues) {
        return displayError(errorOnGetValues);
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
            await refetchRecordFormWithValues();
        }

        return submitRes;
    };

    const _handleValueDelete: DeleteValueFunc = async (value, attribute) => {
        const deleteRes = await onValueDelete(value, attribute);

        _checkDependencyChange(attribute);

        await refetchRecordFormWithValues();

        return deleteRes;
    };

    const rootElement: FormElement<{}> = {
        id: FORM_ROOT_CONTAINER_ID,
        containerId: null,
        type: FormElementTypes.layout,
        uiElementType: FormUIElementTypes.FIELDS_CONTAINER,
        settings: {},
        attribute: null,
        uiElement: formComponents[FormUIElementTypes.FIELDS_CONTAINER],
        record
    };

    // Used to get different event from children elements (e.g., listen to onTabClick event from FormTab element)
    const onCustomEvent = (event: ICustomEventResult): void => {
        // If a tab has been click
        // Re-calculate visible elements and fetch values
        if (event.eventName === 'onTabClick') {
            handleTabClick(event.tabIdClicked);
        }
    };

    // Create an object where key is container id and value is the element
    const elementsByContainer = extractFormElements(recordFormWithValues || recordForm, errorOnGetValues);

    return (
        <WrappedForm
            id={formElementId ?? EDIT_OR_CREATE_RECORD_FORM_ID}
            form={antdForm}
            onFinish={() =>
                onRecordSubmit(
                    recordForm.elements.filter(element => element.attribute?.id).map(element => element.attribute)
                )
            }
        >
            <rootElement.uiElement
                // Use a hash of a record form as a key to force a full re-render when the form changes
                key={recordFormHash}
                antdForm={antdForm}
                valuesMappedByAttributeId={valuesMappedByAttributeId}
                formIdToLoad={formIdToLoad}
                element={rootElement}
                readonly={readonly}
                // todo there is two readonly, one for form and for the attribut
                pendingValues={pendingValues}
                onValueSubmit={_handleValueSubmit}
                onValueDelete={_handleValueDelete}
                onDeleteMultipleValues={onDeleteMultipleValues}
                onCustomEvent={onCustomEvent}
                record={record}
                elementsByContainer={elementsByContainer}
            />
        </WrappedForm>
    );
};

export default EditRecordContent;
