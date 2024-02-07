// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import useUserData from 'hooks/useUserData';
import {useTranslation} from 'react-i18next';
import {match} from 'react-router-dom-v5';
import {PermissionsActions} from '_gqlTypes/globalTypes';
import {ErrorDisplayTypes} from '_types/errors';
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
    const isNewLib = !libraryId;
    const userData = useUserData();
    const {t} = useTranslation();

    const {loading, error, data} = useQuery<GET_LIB_BY_ID, GET_LIB_BY_IDVariables>(getLibByIdQuery, {
        variables: {id: [libraryId]},
        skip: isNewLib
    });
    const readOnly = isNewLib
        ? !userData.permissions[PermissionsActions.admin_create_library]
        : !data?.libraries?.list[0]?.permissions.admin_library;

    if (!libraryId && !userData.permissions[PermissionsActions.admin_create_library]) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} />;
    }

    const _getEditLibraryTabs = (libToEdit: GET_LIB_BY_ID_libraries_list | null) => {
        return <EditLibraryTabs library={libToEdit} readOnly={readOnly} />;
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!isNewLib && !data?.libraries?.list?.length) {
        return <ErrorDisplay message={t('libraries.unknown_library')} />;
    }

    return _getEditLibraryTabs(isNewLib ? null : data.libraries.list[0]);
};

export default EditLibrary;
