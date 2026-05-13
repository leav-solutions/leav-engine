import {type StoreObject} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import useUserData from '../../../hooks/useUserData';
import {deleteFromCache} from '../../../utils/utils';
import {type GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsActions, useDeleteLibraryMutation} from '../../../_gqlTypes';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';

interface IDeleteLibraryProps {
    library: GET_LIBRARIES_libraries_list;
    filters?: any;
}

const DeleteLibrary = ({library, filters}: IDeleteLibraryProps): JSX.Element | null => {
    const {t} = useTranslation();
    const userData = useUserData();

    const [deleteLib] = useDeleteLibraryMutation({
        update: (cache, {data: {deleteLibrary}}) => {
            deleteFromCache(cache, deleteLibrary as unknown as StoreObject);
        },
    });

    const _handleDelete = async () =>
        deleteLib({
            variables: {libID: library.id},
        });

    const libLabel = library.label !== null ? library.label.fr || library.label.en || library.id : library.id;

    return userData.permissions[PermissionsActions.admin_delete_library] ? (
        <ConfirmedButton action={_handleDelete} confirmMessage={t('libraries.confirm_delete', {libLabel})}>
            <DeleteButton disabled={!!library.system} />
        </ConfirmedButton>
    ) : null;
};

export default DeleteLibrary;
