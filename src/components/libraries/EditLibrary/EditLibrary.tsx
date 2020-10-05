import {useQuery} from '@apollo/react-hooks';
import {History, Location} from 'history';
import React from 'react';
import useLang from '../../../hooks/useLang';
import useUserData from '../../../hooks/useUserData';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import {GET_LIBRARIES, GET_LIBRARIESVariables, GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import Loading from '../../shared/Loading';
import EditLibraryTabs from './EditLibraryTabs';

interface IEditLibraryProps {
    match: any;
    history: History;
    location: Location;
}

const EditLibrary = ({match, history, location}: IEditLibraryProps): JSX.Element => {
    const libraryId = match.params.id;
    const {lang} = useLang();
    const userData = useUserData();
    const readOnly = !userData.permissions[PermissionsActions.app_edit_library];

    const {loading, error, data} = useQuery<GET_LIBRARIES, GET_LIBRARIESVariables>(getLibsQuery, {
        variables: {id: libraryId, lang}
    });

    const _getEditLibraryTabs = (libToEdit: GET_LIBRARIES_libraries_list | null) => {
        return <EditLibraryTabs library={libToEdit} readOnly={readOnly} history={history} location={location} />;
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
