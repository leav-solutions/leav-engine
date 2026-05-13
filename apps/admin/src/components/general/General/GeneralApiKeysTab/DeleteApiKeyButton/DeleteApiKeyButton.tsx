import {type WithTypename} from '@leav/utils';
import ConfirmedButton from '../../../../shared/ConfirmedButton';
import DeleteButton from '../../../../shared/DeleteButton';
import useUserData from '../../../../../hooks/useUserData';
import {useTranslation} from 'react-i18next';
import {deleteFromCache} from '../../../../../utils';
import {type DELETE_API_KEY_deleteApiKey} from '../../../../../_gqlTypes/DELETE_API_KEY';
import {type GET_API_KEYS_apiKeys_list} from '../../../../../_gqlTypes/GET_API_KEYS';
import {PermissionsActions, useDeleteApiKeyMutation} from '../../../../../_gqlTypes';

interface IDeleteApiKeyProps {
    apiKey?: GET_API_KEYS_apiKeys_list;
}

const DeleteApiKey = ({apiKey}: IDeleteApiKeyProps): JSX.Element | null => {
    const {t} = useTranslation();
    const userData = useUserData();

    const [deleteKey] = useDeleteApiKeyMutation({
        update: (cache, {data: {deleteApiKey}}) => {
            deleteFromCache(cache, deleteApiKey as WithTypename<DELETE_API_KEY_deleteApiKey>);
        },
    });

    const _handleDelete = async () =>
        deleteKey({
            variables: {id: apiKey.id},
        });

    return userData.permissions[PermissionsActions.admin_delete_api_key] ? (
        <ConfirmedButton action={_handleDelete} confirmMessage={t('api_keys.confirm_delete', {keyLabel: apiKey.label})}>
            <DeleteButton disabled={false} />
        </ConfirmedButton>
    ) : null;
};

export default DeleteApiKey;
