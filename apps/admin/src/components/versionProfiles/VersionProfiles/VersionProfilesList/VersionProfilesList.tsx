// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import Loading from 'components/shared/Loading';
import useLang from 'hooks/useLang';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Input, Table} from 'semantic-ui-react';
import {GET_VERSION_PROFILES_versionProfiles_list} from '_gqlTypes/GET_VERSION_PROFILES';

interface IVersionProfilesListProps {
    profiles: GET_VERSION_PROFILES_versionProfiles_list[] | null;
    onRowClick: (profile: GET_VERSION_PROFILES_versionProfiles_list) => void;
    onFiltersUpdate?: (filters: any) => void;
    loading: boolean;
    withFilters?: boolean;
    filters?: any;
    actions?: JSX.Element;
}

function VersionProfilesList({
    profiles,
    onRowClick,
    onFiltersUpdate,
    loading,
    withFilters,
    filters,
    actions
}: IVersionProfilesListProps): JSX.Element {
    const _handleFilterChange = (e, d: any) => {
        onFiltersUpdate(d);
    };

    const {t} = useTranslation();
    const availableLanguages = useLang().lang;
    const actionsList: React.ReactNode[] = actions ? (!Array.isArray(actions) ? [actions] : actions) : [];

    return (
        <Table selectable striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell width={4}>{t('admin.label')}</Table.HeaderCell>
                    <Table.HeaderCell width={4}>{t('admin.id')}</Table.HeaderCell>
                    <Table.HeaderCell width={1} />
                </Table.Row>
                {withFilters && (
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
                        <Table.HeaderCell>
                            <Input
                                size="small"
                                fluid
                                placeholder={t('admin.id') + '...'}
                                name="id"
                                aria-label="id"
                                value={filters.id || ''}
                                onChange={_handleFilterChange}
                            />
                        </Table.HeaderCell>
                        <Table.HeaderCell />
                    </Table.Row>
                )}
            </Table.Header>
            <Table.Body>
                {loading ? (
                    <Table.Row>
                        <Table.Cell colSpan={6}>
                            <Loading />
                        </Table.Cell>
                    </Table.Row>
                ) : (
                    (profiles ?? []).map(profile => {
                        const onClick = () => onRowClick(profile);
                        const profileLabel = localizedTranslation(profile.label, availableLanguages);
                        return (
                            <Table.Row key={profile.id} onClick={onClick}>
                                <Table.Cell>{profileLabel}</Table.Cell>
                                <Table.Cell>{profile.id}</Table.Cell>
                                <Table.Cell textAlign="right" width={1} className="actions">
                                    {actionsList.map(child =>
                                        React.cloneElement(child as React.ReactElement<any>, {profile})
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

export default VersionProfilesList;
