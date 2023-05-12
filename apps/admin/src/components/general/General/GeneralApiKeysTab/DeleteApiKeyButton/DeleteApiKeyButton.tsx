// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation} from '@apollo/client';
import {WithTypename} from '@leav/utils';
import ConfirmedButton from 'components/shared/ConfirmedButton';
import DeleteButton from 'components/shared/DeleteButton';
import useUserData from 'hooks/useUserData';
import {deleteApiKeyMutation} from 'queries/apiKeys/deleteApiKeyMutation';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {deleteFromCache} from 'utils';
import {DELETE_API_KEY, DELETE_API_KEYVariables, DELETE_API_KEY_deleteApiKey} from '_gqlTypes/DELETE_API_KEY';
import {GET_API_KEYS_apiKeys_list} from '_gqlTypes/GET_API_KEYS';
import {PermissionsActions} from '_gqlTypes/globalTypes';

interface IDeleteApiKeyProps {
    apiKey?: GET_API_KEYS_apiKeys_list;
}

const DeleteApiKey = ({apiKey}: IDeleteApiKeyProps): JSX.Element | null => {
    const {t} = useTranslation();
    const userData = useUserData();

    const [deleteKey] = useMutation<DELETE_API_KEY, DELETE_API_KEYVariables>(deleteApiKeyMutation, {
        update: (cache, {data: {deleteApiKey}}) => {
            deleteFromCache(cache, deleteApiKey as WithTypename<DELETE_API_KEY_deleteApiKey>);
        }
    });

    const _handleDelete = async () =>
        deleteKey({
            variables: {id: apiKey.id}
        });

    return userData.permissions[PermissionsActions.admin_delete_api_key] ? (
        <ConfirmedButton action={_handleDelete} confirmMessage={t('api_keys.confirm_delete', {keyLabel: apiKey.label})}>
            <DeleteButton disabled={false} />
        </ConfirmedButton>
    ) : null;
};

export default DeleteApiKey;
