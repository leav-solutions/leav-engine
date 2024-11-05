// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import useUserData from 'hooks/useUserData';
import {getApiKeysQuery} from 'queries/apiKeys/getApiKeysQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Icon} from 'semantic-ui-react';
import {addWildcardToFilters} from 'utils';
import {GET_API_KEYS, GET_API_KEYS_apiKeys_list} from '_gqlTypes/GET_API_KEYS';
import {ApiKeysFiltersInput, PermissionsActions} from '_gqlTypes/globalTypes';
import ApiKeysList from './ApiKeysList';
import DeleteApiKeyButton from './DeleteApiKeyButton';
import EditApiKeyModal from './EditApiKeyModal';

interface IApiKeyEditingState {
    apiKey: GET_API_KEYS_apiKeys_list;
    isEditing: boolean;
}

function GeneralApiKeysTab(): JSX.Element {
    const userData = useUserData();
    const {t} = useTranslation();

    const [filters, setFilters] = React.useState<ApiKeysFiltersInput>({});
    const [editingState, setEditingState] = React.useState<IApiKeyEditingState>({
        apiKey: null,
        isEditing: false
    });

    const {loading, error, data} = useQuery<GET_API_KEYS>(getApiKeysQuery, {
        variables: {filters: {...addWildcardToFilters(filters, ['label'])}}
    });

    const _handleFiltersUpdate = (newFilters: ApiKeysFiltersInput) => {
        setFilters(newFilters);
    };

    const _handleRowClick = (apiKey: GET_API_KEYS_apiKeys_list) => {
        setEditingState({apiKey, isEditing: true});
    };

    const _handleEditModalClose = () => {
        setEditingState({apiKey: null, isEditing: false});
    };

    const _handleOpenNewKeyModal = () => {
        setEditingState({apiKey: null, isEditing: true});
    };

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    const list = data?.apiKeys.list ?? [];

    return (
        <>
            {userData.permissions[PermissionsActions.admin_create_api_key] && (
                <Button primary icon labelPosition="left" size="medium" onClick={_handleOpenNewKeyModal}>
                    <Icon name="plus" />
                    {t('api_keys.new')}
                </Button>
            )}
            <ApiKeysList
                apiKeys={list}
                filters={filters}
                sort={null}
                loading={loading}
                onFiltersUpdate={_handleFiltersUpdate}
                onRowClick={_handleRowClick}
                actions={[<DeleteApiKeyButton />]}
            />
            {editingState.isEditing && <EditApiKeyModal apiKey={editingState.apiKey} onClose={_handleEditModalClose} />}
        </>
    );
}

export default GeneralApiKeysTab;
