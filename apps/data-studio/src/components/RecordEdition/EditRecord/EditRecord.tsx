// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorDisplay} from '@leav/ui';
import {FormUIElementTypes, FORM_ROOT_CONTAINER_ID, simpleStringHash} from '@leav/utils';
import useGetRecordForm from 'hooks/useGetRecordForm';
import useRecordsConsultationHistory from 'hooks/useRecordsConsultationHistory';
import {useRecordUpdateSubscription} from 'hooks/useRecordUpdateSubscription';
import {useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {FormElementTypes} from '_gqlTypes/globalTypes';
import {IRecordIdentityWhoAmI} from '_types/types';
import {EditRecordReducerActionsTypes} from '../editRecordModalReducer/editRecordModalReducer';
import {useEditRecordModalReducer} from '../editRecordModalReducer/useEditRecordModalReducer';
import EditRecordSkeleton from './EditRecordSkeleton';
import extractFormElements from './helpers/extractFormElements';
import {RecordEditionContext} from './hooks/useRecordEditionContext';
import {formComponents} from './uiElements';
import {DeleteMultipleValuesFunc, DeleteValueFunc, FormElement, SubmitValueFunc} from './_types';

interface IEditRecordProps {
    record: IRecordIdentityWhoAmI | null;
    library: string;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
    onDeleteMultipleValues: DeleteMultipleValuesFunc;
    readonly: boolean;
}

function EditRecord({
    record,
    library,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
    readonly
}: IEditRecordProps): JSX.Element {
    const formId = record ? 'edition' : 'creation';
    const {t} = useTranslation();
    const {state, dispatch} = useEditRecordModalReducer();

    useRecordsConsultationHistory(record?.library?.id ?? null, record?.id ?? null);

    const {data: recordUpdateData} = useRecordUpdateSubscription(
        {records: [record?.id], ignoreOwnEvents: true},
        !record?.id
    );

    useEffect(() => {
        if (recordUpdateData) {
            dispatch({
                type: EditRecordReducerActionsTypes.ADD_EXTERNAL_UPDATE,
                modifier: recordUpdateData?.recordUpdate?.record?.modified_by?.whoAmI,
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

    // Use a hash of record form as a key to force a full re-render when the form changes
    return (
        <RecordEditionContext.Provider value={{elements: elementsByContainer, readOnly: readonly, record}}>
            <rootElement.uiElement
                key={recordFormHash}
                element={rootElement}
                onValueSubmit={_handleValueSubmit}
                onValueDelete={_handleValueDelete}
                onDeleteMultipleValues={onDeleteMultipleValues}
            />
        </RecordEditionContext.Provider>
    );
}

export default EditRecord;
