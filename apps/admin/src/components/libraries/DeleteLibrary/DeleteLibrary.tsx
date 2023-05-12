// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {StoreObject, useMutation} from '@apollo/client';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {DELETE_LIBRARY, DELETE_LIBRARYVariables} from '_gqlTypes/DELETE_LIBRARY';
import useUserData from '../../../hooks/useUserData';
import {deleteLibQuery} from '../../../queries/libraries/deleteLibMutation';
import {deleteFromCache} from '../../../utils/utils';
import {GET_LIBRARIES_libraries_list} from '../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import ConfirmedButton from '../../shared/ConfirmedButton';
import DeleteButton from '../../shared/DeleteButton';

interface IDeleteLibraryProps {
    library: GET_LIBRARIES_libraries_list;
    filters?: any;
}

const DeleteLibrary = ({library, filters}: IDeleteLibraryProps): JSX.Element | null => {
    const {t} = useTranslation();
    const userData = useUserData();

    const [deleteLib] = useMutation<DELETE_LIBRARY, DELETE_LIBRARYVariables>(deleteLibQuery, {
        update: (cache, {data: {deleteLibrary}}) => {
            deleteFromCache(cache, (deleteLibrary as unknown) as StoreObject);
        }
    });

    const _handleDelete = async () =>
        deleteLib({
            variables: {libID: library.id}
        });

    const libLabel = library.label !== null ? library.label.fr || library.label.en || library.id : library.id;

    return userData.permissions[PermissionsActions.admin_delete_library] ? (
        <ConfirmedButton action={_handleDelete} confirmMessage={t('libraries.confirm_delete', {libLabel})}>
            <DeleteButton disabled={!!library.system} />
        </ConfirmedButton>
    ) : null;
};

export default DeleteLibrary;
