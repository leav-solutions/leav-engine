// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {getFormQuery} from 'graphQL/queries/forms/getFormQuery';
import useRecordsConsultationHistory from 'hooks/useRecordsConsultationHistory';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {GET_FORM, GET_FORMVariables} from '_gqlTypes/GET_FORM';
import {IRecordIdentityWhoAmI} from '_types/types';
import EditRecordForm from './EditRecordForm';
import EditRecordSkeleton from './EditRecordSkeleton';
import {DeleteValueFunc, SubmitValueFunc} from './_types';

interface IEditRecordProps {
    record: IRecordIdentityWhoAmI | null;
    library: string;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
}

function EditRecord({record, library, onValueSubmit, onValueDelete}: IEditRecordProps): JSX.Element {
    const formId = record ? 'edition' : 'creation';
    const {t} = useTranslation();

    useRecordsConsultationHistory(record?.library?.id ?? null, record?.id ?? null);

    // Get Form
    const {loading, error, data} = useQuery<GET_FORM, GET_FORMVariables>(getFormQuery, {
        variables: {
            library,
            formId
        }
    });

    if (loading) {
        return <EditRecordSkeleton rows={5} />;
    }

    if (error || !data?.forms?.list?.length) {
        return <ErrorDisplay message={error?.message ?? t('record_edition.no_form_error')} />;
    }

    return (
        <EditRecordForm
            record={record}
            library={library}
            form={data.forms.list[0]}
            onValueSubmit={onValueSubmit}
            onValueDelete={onValueDelete}
        />
    );
}

export default EditRecord;
