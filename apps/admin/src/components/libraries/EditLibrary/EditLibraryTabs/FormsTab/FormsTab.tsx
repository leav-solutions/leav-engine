// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import React, {useState} from 'react';
import {deleteFormQuery} from '../../../../../queries/forms/deleteFormMutation';
import {getFormsQuery} from '../../../../../queries/forms/getFormsQuery';
import {addWildcardToFilters, clearCacheForQuery} from '../../../../../utils';
import {DELETE_FORM, DELETE_FORMVariables} from '../../../../../_gqlTypes/DELETE_FORM';
import {GET_FORMS_LIST, GET_FORMS_LISTVariables} from '../../../../../_gqlTypes/GET_FORMS_LIST';
import {IFormFilterOptions} from '../../../../../_types/forms';
import EditFormModal from './EditFormModal';
import FormsList from './FormsList';

interface IFormsTabProps {
    libraryId: string;
    readonly: boolean;
}

function FormsTab({libraryId, readonly}: IFormsTabProps): JSX.Element {
    const [filters, setFilters] = useState<IFormFilterOptions>({});
    const {loading, error, data} = useQuery<GET_FORMS_LIST, GET_FORMS_LISTVariables>(getFormsQuery, {
        variables: {...addWildcardToFilters(filters), library: libraryId}
    });

    const [deleteForm] = useMutation<DELETE_FORM, DELETE_FORMVariables>(deleteFormQuery);

    const [editedForm, setEditedForm] = useState<string | null>(null);
    const [openEditionModal, setOpenEditionModal] = useState<boolean>(false);

    const _handleFormEditionClose = () => {
        setOpenEditionModal(false);
    };

    const _handleFiltersChange = (filterElem: any) => {
        const newElemState =
            filterElem.type === 'checkbox'
                ? filterElem.indeterminate
                    ? undefined
                    : filterElem.checked
                : filterElem.value;

        const newFilters = {
            ...filters,
            [filterElem.name]: newElemState
        };

        setFilters(newFilters);
    };

    const _handleCreate = () => {
        setEditedForm(null);
        setOpenEditionModal(true);
    };

    const _handleRowClick = (formId: string) => {
        setEditedForm(formId);
        setOpenEditionModal(true);
    };

    const _handleDelete = (formId: string) => deleteForm({
            variables: {
                formId,
                library: libraryId
            },
            update: (cache, {data: {deleteForm: deletedForm}}: any) => {
                // Get cached data for library's forms list
                const cacheData = cache.readQuery<GET_FORMS_LIST, GET_FORMS_LISTVariables>({
                    query: getFormsQuery,
                    variables: {library: libraryId}
                });

                // Clear everything in cache related to this library's forms list. There might be
                // some filtered list here
                clearCacheForQuery(cache, 'forms', {filters: {library: libraryId}});

                // Rewrite cache for the full forms list only (no filters).
                // If a filtered list is being displayed, it won't refresh automatically.
                // It's not optimal, but we consider the most common use case when creating form is
                // displaying the full list. As it's not trivial at all to refresh every possible
                // filters properly, we don't do it.
                const newCacheData = {
                    forms: {
                        list: [...(cacheData?.forms?.list || [])].filter(f => f.id !== deletedForm.id),
                        totalCount: cacheData?.forms?.totalCount ? cacheData?.forms?.totalCount - 1 : 0,
                        __typename: 'FormsList'
                    }
                };

                cache.writeQuery({
                    query: getFormsQuery,
                    variables: {library: libraryId},
                    data: newCacheData
                });
            }
        });

    if (error) {
        return <div className="error">Error {error.message}</div>;
    }

    if (!loading && !data?.forms?.list) {
        return <div>Could not retrieve forms</div>;
    }

    return (
        <>
            <FormsList
                loading={loading}
                libraryId={libraryId}
                forms={data?.forms?.list || []}
                filters={filters}
                onFiltersChange={_handleFiltersChange}
                onCreate={_handleCreate}
                onRowClick={_handleRowClick}
                onDelete={_handleDelete}
            />
            {openEditionModal && (
                <EditFormModal
                    formId={editedForm}
                    open={openEditionModal}
                    libraryId={libraryId}
                    onClose={_handleFormEditionClose}
                    readonly={readonly}
                />
            )}
        </>
    );
}

export default FormsTab;
