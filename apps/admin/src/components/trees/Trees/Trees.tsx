// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import {useCurrentApplicationContext} from 'context/CurrentApplicationContext';
import {type History} from 'history';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {RiNodeTree} from 'react-icons/ri';
import {Link} from 'react-router-dom-v5';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import styled from 'styled-components';
import useUserData from '../../../hooks/useUserData';
import {addWildcardToFilters, isTreeInApp} from '../../../utils/utils';
import {type GET_TREESVariables, type GET_TREES_trees_list} from '../../../_gqlTypes/GET_TREES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import TreesList from '../TreesList';
import {useGetTreesQuery} from '_gqlTypes';

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
    const applicationData = useCurrentApplicationContext();

    const [filters, setFilters] = useState<Partial<GET_TREESVariables>>({});
    const {loading, error, data} = useGetTreesQuery({
        variables: {...addWildcardToFilters(filters)},
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
            [filterElem.name]: newElemState,
        });
    };

    const _handleRowClick = (tree: GET_TREES_trees_list) => history.push('/trees/edit/' + tree.id);
    const trees = (data?.trees?.list ?? []).filter(tree => isTreeInApp(applicationData.currentApp, tree.id));

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
                        <Button primary icon labelPosition="left" size="medium" as={Link} to="/trees/edit/">
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
                    trees={trees as GET_TREES_trees_list[]}
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
