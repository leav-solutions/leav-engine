// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import useUserData from 'hooks/useUserData';
import {getVersionProfilesQuery} from 'queries/versionProfiles/getVersionProfilesQuery';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {VscLayers} from 'react-icons/vsc';
import {Link, useHistory} from 'react-router-dom';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import {addWildcardToFilters} from 'utils';
import {GET_VERSION_PROFILES, GET_VERSION_PROFILESVariables} from '_gqlTypes/GET_VERSION_PROFILES';
import {PermissionsActions, VersionProfilesFiltersInput} from '_gqlTypes/globalTypes';
import VersionProfilesList from './VersionProfilesList';
import DeleteProfileButton from './VersionProfilesList/DeleteProfileButton';

const Title = styled(Header)`
    display: flex;
    gap: 0.5rem;
`;

function VersionProfiles(): JSX.Element {
    const {t} = useTranslation();
    const [filters, setFilters] = useState<VersionProfilesFiltersInput>({});
    const userData = useUserData();
    const history = useHistory();

    const {loading, error, data} = useQuery<GET_VERSION_PROFILES, GET_VERSION_PROFILESVariables>(
        getVersionProfilesQuery,
        {variables: {filters: {...addWildcardToFilters(filters, ['label', 'id'])}}}
    );

    const _onFiltersUpdate = (filterElem: any) => {
        setFilters({
            ...filters,
            [filterElem.name]: filterElem.value
        });
    };

    const _handleRowClick = versionProfile => history.push('/version_profiles/edit/' + versionProfile.id);

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    return (
        <>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <Title size="large">
                        <VscLayers size={30} />
                        {t('version_profiles.title')}
                    </Title>
                </Grid.Column>
                {userData.permissions[PermissionsActions.admin_create_version_profile] && (
                    <Grid.Column floated="right" width={6} textAlign="right" verticalAlign="middle">
                        <Button
                            primary
                            icon
                            labelPosition="left"
                            size="medium"
                            as={Link}
                            to={'/version_profiles/edit/'}
                        >
                            <Icon name="plus" />
                            {t('version_profiles.new')}
                        </Button>
                    </Grid.Column>
                )}
            </Grid>
            {!error ? (
                <VersionProfilesList
                    loading={loading}
                    onRowClick={_handleRowClick}
                    profiles={data?.versionProfiles?.list ?? []}
                    actions={<DeleteProfileButton key="delete" />}
                    filters={filters}
                    onFiltersUpdate={_onFiltersUpdate}
                    withFilters
                />
            ) : (
                <p>Error: {error.message}</p>
            )}
        </>
    );
}

export default VersionProfiles;
