// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {useCurrentApplicationContext} from 'context/CurrentApplicationContext';
import {History} from 'history';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {AiOutlineDatabase} from 'react-icons/ai';
import {Link} from 'react-router-dom-v5';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import useUserData from '../../../hooks/useUserData';
import {getLibsQuery} from '../../../queries/libraries/getLibrariesQuery';
import {addWildcardToFilters, isLibraryInApp} from '../../../utils/utils';
import {GET_LIBRARIES, GET_LIBRARIESVariables} from '../../../_gqlTypes/GET_LIBRARIES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import LibrariesList from '../LibrariesList';

const Title = styled(Header)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

interface ILibrariesProps {
    history: History;
}

const Libraries = ({history}: ILibrariesProps): JSX.Element => {
    const {t} = useTranslation();
    const userData = useUserData();
    const applicationData = useCurrentApplicationContext();

    const [filters, setFilters] = useState<any>({});
    const {loading, error, data} = useQuery<GET_LIBRARIES, GET_LIBRARIESVariables>(getLibsQuery, {
        variables: {...addWildcardToFilters(filters)}
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
    const onRowClick = library => history.push('/libraries/edit/' + library.id);
    const libraries = (data?.libraries?.list ?? []).filter(lib => isLibraryInApp(applicationData.currentApp, lib.id));

    return (
        <>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <Title size="large">
                        <AiOutlineDatabase size={30} />
                        {t('libraries.title')}
                    </Title>
                </Grid.Column>
                {userData.permissions[PermissionsActions.admin_create_library] && (
                    <Grid.Column floated="right" width={6} textAlign="right" verticalAlign="middle">
                        <Button primary icon labelPosition="left" size="medium" as={Link} to={'/libraries/edit'}>
                            <Icon name="plus" />
                            {t('libraries.new')}
                        </Button>
                    </Grid.Column>
                )}
            </Grid>
            {typeof error !== 'undefined' ? (
                <p>Error: {error.message}</p>
            ) : (
                <LibrariesList
                    loading={loading || !data}
                    libraries={libraries}
                    onRowClick={onRowClick}
                    onFiltersUpdate={_onFiltersUpdate}
                    filters={filters}
                />
            )}
        </>
    );
};

export default Libraries;
