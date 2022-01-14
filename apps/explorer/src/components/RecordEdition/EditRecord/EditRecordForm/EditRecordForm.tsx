// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {
    getRecordDependenciesValuesQuery,
    IGetRecordDependenciesValues,
    IGetRecordDependenciesValuesVariables
} from 'graphQL/queries/forms/getRecordDependenciesValuesQuery';
import {noopQuery} from 'graphQL/queries/noopQuery';
import React from 'react';
import {GET_FORM_forms_list} from '_gqlTypes/GET_FORM';
import {IRecordIdentityWhoAmI} from '_types/types';
import EditRecordSkeleton from '../EditRecordSkeleton';
import convertDependenciesRecordValues from '../helpers/convertDependenciesRecordValues';
import extractFormElements from '../helpers/extractFormElements';
import {RecordEditionContext} from '../hooks/useRecordEditionContext';
import {DeleteValueFunc, SubmitValueFunc} from '../_types';
import RootContainer from './RootContainer';

interface IEditRecordFormProps {
    form: GET_FORM_forms_list;
    record: IRecordIdentityWhoAmI | null;
    onValueSubmit: SubmitValueFunc;
    onValueDelete: DeleteValueFunc;
    readonly: boolean;
}

function EditRecordForm({form, record, onValueSubmit, onValueDelete, readonly}: IEditRecordFormProps): JSX.Element {
    const depAttributes = form.dependencyAttributes.map(dependencyAttribute => dependencyAttribute.id);
    const dependenciesValuesQuery = record
        ? getRecordDependenciesValuesQuery(record?.library?.gqlNames?.query, depAttributes)
        : noopQuery;

    const {loading, error, data} = useQuery<IGetRecordDependenciesValues, IGetRecordDependenciesValuesVariables>(
        dependenciesValuesQuery,
        {
            skip: !record || !form.dependencyAttributes.length,
            variables: {id: record?.id}
        }
    );

    if (loading) {
        return <EditRecordSkeleton rows={5} />;
    }

    if (error) {
        return <ErrorDisplay message={error?.message ?? ''} />;
    }

    // Convert record values to a more exploitable format
    const recordValues = data?.record?.list?.[0] ?? {};
    const dependenciesValues = convertDependenciesRecordValues(recordValues, depAttributes);
    const elementsByContainer = extractFormElements(form, dependenciesValues);

    return (
        <RecordEditionContext.Provider value={{elements: elementsByContainer, readOnly: readonly}}>
            <RootContainer record={record} onValueSubmit={onValueSubmit} onValueDelete={onValueDelete} />
        </RecordEditionContext.Provider>
    );
}

export default EditRecordForm;
