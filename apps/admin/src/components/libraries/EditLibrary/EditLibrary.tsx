import ErrorDisplay from '../../shared/ErrorDisplay';
import useUserData from '../../../hooks/useUserData';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import {PermissionsActions, useGetLibByIdQuery} from '../../../_gqlTypes';
import {ErrorDisplayTypes} from '../../../_types/errors';
import {type GET_LIB_BY_ID_libraries_list} from '../../../_gqlTypes/GET_LIB_BY_ID';
import Loading from '../../shared/Loading';
import EditLibraryTabs from './EditLibraryTabs';

const EditLibrary = (): JSX.Element => {
    const routeMatch = useParams();
    const libraryId = routeMatch.id;
    const isNewLib = !libraryId;
    const userData = useUserData();
    const {t} = useTranslation();

    const {loading, error, data} = useGetLibByIdQuery({
        variables: {id: [libraryId]},
        skip: isNewLib,
    });
    const readOnly = isNewLib
        ? !userData.permissions[PermissionsActions.admin_create_library]
        : !data?.libraries?.list[0]?.permissions.admin_library;

    if (!libraryId && !userData.permissions[PermissionsActions.admin_create_library]) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} />;
    }

    const _getEditLibraryTabs = (libToEdit: GET_LIB_BY_ID_libraries_list | null) => (
        <EditLibraryTabs library={libToEdit} readOnly={readOnly} />
    );

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!isNewLib && !data?.libraries?.list?.length) {
        return <ErrorDisplay message={t('libraries.unknown_library')} />;
    }

    return _getEditLibraryTabs(isNewLib ? null : (data.libraries.list[0] as GET_LIB_BY_ID_libraries_list));
};

export default EditLibrary;
