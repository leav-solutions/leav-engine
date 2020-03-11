import {History} from 'history';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import useLang from '../../../hooks/useLang';
import useUserData from '../../../hooks/useUserData';
import {getTreesQuery, TreesQuery} from '../../../queries/trees/getTreesQuery';
import {addWildcardToFilters} from '../../../utils/utils';
import {GET_TREESVariables} from '../../../_gqlTypes/GET_TREES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import TreesList from '../TreesList';

interface ITreesProps {
    history: History;
}

/* tslint:disable-next-line:variable-name */
const Trees = ({history}: ITreesProps): JSX.Element => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const [filters, setFilters] = useState<Partial<GET_TREESVariables>>({});
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

    return (
        <>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <Header size="large">
                        <Icon name="share alternate" />
                        {t('trees.title')}
                    </Header>
                </Grid.Column>
                {userData.permissions[PermissionsActions.admin_create_tree] && (
                    <Grid.Column floated="right" width={3} textAlign="right" verticalAlign="middle">
                        <Button icon labelPosition="left" size="medium" as={Link} to={'/trees/edit/'}>
                            <Icon name="plus" />
                            {t('trees.new')}
                        </Button>
                    </Grid.Column>
                )}
            </Grid>
            <TreesQuery query={getTreesQuery} variables={{...addWildcardToFilters(filters), lang}}>
                {({loading, error, data}) => {
                    if (typeof error !== 'undefined') {
                        return <p>Error : {error.message}</p>;
                    }

                    const onRowClick = tree => history.push('/trees/edit/' + tree.id);

                    return (
                        <TreesList
                            trees={data && data.trees ? data.trees.list : null}
                            onRowClick={onRowClick}
                            onFiltersUpdate={_onFiltersUpdate}
                            filters={filters}
                            loading={loading}
                        />
                    );
                }}
            </TreesQuery>
        </>
    );
};

export default Trees;
