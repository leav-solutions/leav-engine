// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {FormUIElementTypes, FORM_ROOT_CONTAINER_ID} from '@leav/utils';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {getRecordFormQuery} from 'graphQL/queries/forms/getRecordFormQuery';
import useRecordsConsultationHistory from 'hooks/useRecordsConsultationHistory';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {FormElementTypes} from '_gqlTypes/globalTypes';
import {RECORD_FORM, RECORD_FORMVariables} from '_gqlTypes/RECORD_FORM';
import {IRecordIdentityWhoAmI} from '_types/types';
import EditRecordSkeleton from './EditRecordSkeleton';
import extractFormElements from './helpers/extractFormElements';
import {RecordEditionContext} from './hooks/useRecordEditionContext';
import {formComponents} from './uiElements';
import {DeleteValueFunc, FormElement, SubmitValueFunc} from './_types';

interface IEditRecordProps {
    record: IRecordIdentityWhoAmI | null;
    library: string;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
    readonly: boolean;
}

function EditRecord({record, library, onValueSubmit, onValueDelete, readonly}: IEditRecordProps): JSX.Element {
    const formId = record ? 'edition' : 'creation';
    const {t} = useTranslation();

    useRecordsConsultationHistory(record?.library?.id ?? null, record?.id ?? null);

    const {loading, data, error} = useQuery<RECORD_FORM, RECORD_FORMVariables>(getRecordFormQuery, {
        fetchPolicy: 'network-only',
        variables: {
            libraryId: library,
            recordId: record?.id,
            formId
        }
    });

    if (loading) {
        return <EditRecordSkeleton rows={5} />;
    }

    if (error) {
        const message =
            Object.values(error.graphQLErrors[0]?.extensions?.exception?.fields ?? {}).join('\n') ?? error?.message;
        return <ErrorDisplay message={message ?? t('record_edition.no_form_error')} />;
    }

    const form = data.recordForm;
    const elementsByContainer = extractFormElements(form);

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

    return (
        <RecordEditionContext.Provider value={{elements: elementsByContainer, readOnly: readonly, record}}>
            <rootElement.uiElement element={rootElement} onValueSubmit={onValueSubmit} onValueDelete={onValueDelete} />
        </RecordEditionContext.Provider>
    );
}

export default EditRecord;
