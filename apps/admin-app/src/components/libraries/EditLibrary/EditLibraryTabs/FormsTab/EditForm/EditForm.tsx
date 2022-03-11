// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import React, {useEffect, useState} from 'react';
import {getFormQuery} from '../../../../../../queries/forms/getFormQuery';
import {GET_FORM, GET_FORMVariables, GET_FORM_forms_list} from '../../../../../../_gqlTypes/GET_FORM';
import Loading from '../../../../../shared/Loading';
import EditFormTabs from './EditFormTabs';
import {EditFormContext} from './hooks/useEditFormContext';

interface IEditFormProps {
    formId: string | null;
    libraryId: string;
    readonly: boolean;
}

function EditForm({formId, libraryId, readonly}: IEditFormProps): JSX.Element {
    const [form, setForm] = useState<GET_FORM_forms_list>(null);

    const {loading, error, data} = useQuery<GET_FORM, GET_FORMVariables>(getFormQuery, {
        variables: {
            library: libraryId,
            id: formId || ''
        },
        skip: !formId
    });

    useEffect(() => {
        if (!data?.forms?.list?.[0]) {
            return;
        }

        setForm(data?.forms?.list?.[0]);
    }, [data]);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div data-test-id="error">ERROR {error.message}</div>;
    }

    if (formId && (!data || !data?.forms?.list.length)) {
        return <div>Cannot retrieve form</div>;
    }

    return (
        <EditFormContext.Provider value={{form, library: libraryId, readonly, setForm}}>
            <EditFormTabs />
        </EditFormContext.Provider>
    );
}

export default EditForm;
