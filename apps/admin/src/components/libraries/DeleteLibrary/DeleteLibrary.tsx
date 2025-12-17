// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type StoreObject} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import useUserData from '../../../hooks/useUserData';
import {deleteFromCache} from '../../../utils/utils';
import {type GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';
import {useDeleteLibraryMutation} from '_gqlTypes';

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
