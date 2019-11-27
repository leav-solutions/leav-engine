import {DataProxy} from 'apollo-cache';
import React from 'react';
import {useTranslation} from 'react-i18next';
import useUserData from '../../../hooks/useUserData';
import {DeleteLibMutation, deleteLibQuery} from '../../../queries/libraries/deleteLibMutation';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import {GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';

interface IDeleteLibraryProps {
    library: GET_LIBRARIES_libraries_list;
}

/* tslint:disable-next-line:variable-name */
const DeleteLibrary = ({library}: IDeleteLibraryProps): JSX.Element | null => {
    const {t} = useTranslation();
    const userData = useUserData();
    const _updateCache = (cache: DataProxy, {data: {deleteLibrary}}: any) => {
        const cacheData: any = cache.readQuery({query: getLibsQuery});
        cache.writeQuery({
            query: getLibsQuery,
            data: {libraries: cacheData.libraries.filter(l => l.id !== deleteLibrary.id)}
        });
    };

    return userData.permissions[PermissionsActions.admin_delete_library] ? (
        <DeleteLibMutation mutation={deleteLibQuery} update={_updateCache}>
            {deleteLib => {
                const onDelete = async () =>
                    deleteLib({
                        variables: {libID: library.id}
                    });

                const libLabel =
                    library.label !== null ? library.label.fr || library.label.en || library.id : library.id;

                return (
                    <ConfirmedButton action={onDelete} confirmMessage={t('libraries.confirm_delete', {libLabel})}>
                        <DeleteButton disabled={!!library.system} />
                    </ConfirmedButton>
                );
            }}
        </DeleteLibMutation>
    ) : null;
};

export default DeleteLibrary;
