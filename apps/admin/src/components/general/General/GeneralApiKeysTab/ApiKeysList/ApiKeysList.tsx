// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Loading from 'components/shared/Loading';
import RecordCard from 'components/shared/RecordCard';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Icon, Input, Popup, Table} from 'semantic-ui-react';
import {GET_API_KEYS_apiKeys_list} from '_gqlTypes/GET_API_KEYS';
import {ApiKeysFiltersInput, SortApiKeysInput} from '_gqlTypes/globalTypes';

interface IApiKeysListProps {
    apiKeys: GET_API_KEYS_apiKeys_list[];
    filters: ApiKeysFiltersInput;
    sort: SortApiKeysInput;
    loading?: boolean;
    onFiltersUpdate?: (filters: ApiKeysFiltersInput) => void;
    onRowClick?: (apiKey: GET_API_KEYS_apiKeys_list) => void;
    actions?: JSX.Element[];
}

function ApiKeysList({
    apiKeys,
    filters,
    loading,
    onFiltersUpdate,
    onRowClick,
    actions
}: IApiKeysListProps): JSX.Element {
    const {t} = useTranslation();

    const _handleFilterChange = (e, d) => {
        onFiltersUpdate({...filters, [d.name]: d.value});
    };

    return (
        <Table selectable striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell width={4}>{t('admin.label')}</Table.HeaderCell>
                    <Table.HeaderCell width={4}>{t('api_keys.expiresAt')}</Table.HeaderCell>
                    <Table.HeaderCell width={4}>{t('api_keys.user')}</Table.HeaderCell>
                    <Table.HeaderCell width={1} />
                </Table.Row>
                <Table.Row className="filters">
                    <Table.HeaderCell>
                        <Input
                            size="small"
                            fluid
                            placeholder={t('admin.label') + '...'}
                            name="label"
                            aria-label="label"
                            value={filters.label || ''}
                            onChange={_handleFilterChange}
                        />
                    </Table.HeaderCell>
                    <Table.HeaderCell />
                    <Table.HeaderCell />
                    <Table.HeaderCell />
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {loading ? (
                    <Table.Row>
                        <Table.Cell colSpan={4}>
                            <Loading />
                        </Table.Cell>
                    </Table.Row>
                ) : (
                    (apiKeys ?? []).map(key => {
                        const onClick = () => {
                            onRowClick(key);
                        };

                        const isExpired = key.expiresAt !== null && key.expiresAt < Date.now() / 1000;

                        return (
                            <Table.Row key={key.id} onClick={onClick}>
                                <Table.Cell>{key.label}</Table.Cell>
                                <Table.Cell>
                                    {isExpired && (
                                        <Popup
                                            content={t('api_keys.expiration_warning')}
                                            trigger={<Icon name="warning sign" color="yellow" />}
                                            position="top center"
                                        />
                                    )}
                                    {key.expiresAt
                                        ? new Date(key.expiresAt * 1000).toLocaleString()
                                        : t('api_keys.never')}
                                </Table.Cell>
                                <Table.Cell>
                                    <RecordCard record={key.user.whoAmI} />
                                </Table.Cell>
                                <Table.Cell textAlign="right" width={1} className="actions">
                                    {actions.map((child, i) =>
                                        React.cloneElement(child as React.ReactElement<any>, {key: i, apiKey: key})
                                    )}
                                </Table.Cell>
                            </Table.Row>
                        );
                    })
                )}
            </Table.Body>
        </Table>
    );
}

export default ApiKeysList;
