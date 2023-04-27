// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import React from 'react';
import {match} from 'react-router-dom';
import useLang from '../../../hooks/useLang';
import {getLibByIdQuery} from '../../../queries/libraries/getLibraryById';
import {GET_LIB_BY_ID, GET_LIB_BY_IDVariables, GET_LIB_BY_ID_libraries_list} from '../../../_gqlTypes/GET_LIB_BY_ID';
import Loading from '../../shared/Loading';
import EditLibraryTabs from './EditLibraryTabs';

export interface IEditLibraryMatchParams {
    id: string;
}

interface IEditLibraryProps {
    match?: match<IEditLibraryMatchParams>;
}

const EditLibrary = ({match: routeMatch}: IEditLibraryProps): JSX.Element => {
    const libraryId = routeMatch.params.id;
    const {lang} = useLang();

    const {loading, error, data} = useQuery<GET_LIB_BY_ID, GET_LIB_BY_IDVariables>(getLibByIdQuery, {
        variables: {id: [libraryId], lang}
    });
    const readOnly = !data?.libraries?.list[0]?.permissions.admin_library;

    const _getEditLibraryTabs = (libToEdit: GET_LIB_BY_ID_libraries_list | null) => {
        return <EditLibraryTabs library={libToEdit} readOnly={readOnly} />;
    };

    if (!libraryId) {
        return _getEditLibraryTabs(null);
    }

    if (loading) {
        return <Loading />;
    }

    if (typeof error !== 'undefined') {
        return <p>Error: {error.message}</p>;
    }

    if (!data || !data.libraries || !data.libraries.list.length) {
        return <p>Unknown library</p>;
    }

    return _getEditLibraryTabs(data.libraries.list[0]);
};

export default EditLibrary;
