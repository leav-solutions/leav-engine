// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FormUIElementTypes, FORM_ROOT_CONTAINER_ID} from '@leav/utils';
import {ErrorDisplay} from '@leav/ui';
import useGetRecordForm from 'hooks/useGetRecordForm';
import useRecordsConsultationHistory from 'hooks/useRecordsConsultationHistory';
import {useTranslation} from 'react-i18next';
import {FormElementTypes} from '_gqlTypes/globalTypes';
import {IRecordIdentityWhoAmI} from '_types/types';
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
    const {state} = useEditRecordModalReducer();

    useRecordsConsultationHistory(record?.library?.id ?? null, record?.id ?? null);

    const {loading, error, recordForm} = useGetRecordForm({
        libraryId: library,
        recordId: record?.id,
        formId,
        version: state.valuesVersion
    });

    if (loading) {
        return <EditRecordSkeleton rows={5} />;
    }

    if (error) {
        const message =
            Object.values(error.graphQLErrors[0]?.extensions?.exception?.fields ?? {}).join('\n') ?? error?.message;

        return <ErrorDisplay message={message ?? t('record_edition.no_form_error')} />;
    }

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

    return (
        <RecordEditionContext.Provider value={{elements: elementsByContainer, readOnly: readonly, record}}>
            <rootElement.uiElement
                element={rootElement}
                onValueSubmit={onValueSubmit}
                onValueDelete={onValueDelete}
                onDeleteMultipleValues={onDeleteMultipleValues}
            />
        </RecordEditionContext.Provider>
    );
}

export default EditRecord;
