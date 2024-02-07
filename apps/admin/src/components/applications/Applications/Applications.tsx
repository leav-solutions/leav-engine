// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {getApplicationsQuery} from 'queries/applications/getApplicationsQuery';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom-v5';
import {useHistory} from 'react-router-v5';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import {GET_APPLICATIONS, GET_APPLICATIONSVariables} from '_gqlTypes/GET_APPLICATIONS';
import useUserData from '../../../hooks/useUserData';
import {addWildcardToFilters} from '../../../utils/utils';
import {ApplicationsFiltersInput, PermissionsActions} from '../../../_gqlTypes/globalTypes';
import ApplicationsList from './ApplicationsList';
import DeleteApplication from './ApplicationsList/DeleteApplication';

const Applications = (): JSX.Element => {
    const {t} = useTranslation();
    const [filters, setFilters] = useState<ApplicationsFiltersInput>({});
    const userData = useUserData();
    const history = useHistory();

    const {loading, error, data} = useQuery<GET_APPLICATIONS, GET_APPLICATIONSVariables>(getApplicationsQuery, {
        variables: {filters: {...addWildcardToFilters(filters, ['label', 'id', 'endpoint'])}}
    });

    const _onFiltersUpdate = (filterElem: any) => {
        const newElemState =
            filterElem.type === 'checkbox'
                ? filterElem.indeterminate
                    ? undefined
                    : filterElem.checked
                : filterElem.value;

        setFilters({
            ...filters,
            [filterElem.name]: newElemState
        });
    };

    const _onRowClick = application => history.push('/applications/edit/' + application.id);

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    return (
        <>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <Header size="large">
                        <Icon name="th" />
                        {t('applications.title')}
                    </Header>
                </Grid.Column>
                {userData.permissions[PermissionsActions.admin_create_application] && (
                    <Grid.Column floated="right" width={6} textAlign="right" verticalAlign="middle">
                        <Button primary icon labelPosition="left" size="medium" as={Link} to={'/applications/edit/'}>
                            <Icon name="plus" />
                            {t('applications.new')}
                        </Button>
                    </Grid.Column>
                )}
            </Grid>
            {!error ? (
                <ApplicationsList
                    loading={loading}
                    applications={data?.applications?.list ?? []}
                    onRowClick={_onRowClick}
                    onFiltersUpdate={_onFiltersUpdate}
                    filters={filters}
                    actions={
                        userData.permissions[PermissionsActions.admin_delete_application] ? (
                            <DeleteApplication key="delete_app" />
                        ) : (
                            <></>
                        )
                    }
                />
            ) : (
                <p>Error: {error.message}</p>
            )}
        </>
    );
};

export default Applications;
