// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {useCurrentApplicationContext} from 'context/CurrentApplicationContext';
import {History} from 'history';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {RiNodeTree} from 'react-icons/ri';
import {Link} from 'react-router-dom';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import useLang from '../../../hooks/useLang';
import useUserData from '../../../hooks/useUserData';
import {getTreesQuery} from '../../../queries/trees/getTreesQuery';
import {addWildcardToFilters, isTreeInApp} from '../../../utils/utils';
import {GET_TREES, GET_TREESVariables, GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import TreesList from '../TreesList';

const Title = styled(Header)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

interface ITreesProps {
    history: History;
}

const Trees = ({history}: ITreesProps): JSX.Element => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const currentApp = useCurrentApplicationContext();

    const [filters, setFilters] = useState<Partial<GET_TREESVariables>>({});
    const {loading, error, data} = useQuery<GET_TREES, GET_TREESVariables>(getTreesQuery, {
        variables: {...addWildcardToFilters(filters), lang}
    });
    const userData = useUserData();

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

    const _handleRowClick = (tree: GET_TREES_trees_list) => history.push('/trees/edit/' + tree.id);
    const trees = (data?.trees?.list ?? []).filter(tree => isTreeInApp(currentApp, tree.id));

    return (
        <>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <Title size="large">
                        <RiNodeTree size={30} />
                        {t('trees.title')}
                    </Title>
                </Grid.Column>
                {userData.permissions[PermissionsActions.admin_create_tree] && (
                    <Grid.Column floated="right" width={6} textAlign="right" verticalAlign="middle">
                        <Button primary icon labelPosition="left" size="medium" as={Link} to={'/trees/edit/'}>
                            <>
                                <Icon name="plus" />
                                {t('trees.new')}
                            </>
                        </Button>
                    </Grid.Column>
                )}
            </Grid>
            {loading && <Loading />}
            {error && <ErrorDisplay message={error.message} />}
            {!loading && !error && (
                <TreesList
                    trees={trees}
                    onRowClick={_handleRowClick}
                    onFiltersUpdate={_onFiltersUpdate}
                    filters={filters}
                    loading={loading}
                />
            )}
        </>
    );
};

export default Trees;
