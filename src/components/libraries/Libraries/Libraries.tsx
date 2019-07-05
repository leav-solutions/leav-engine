import {History} from 'history';
import React, {useState} from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import {Link} from 'react-router-dom';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import useLang from '../../../hooks/useLang';
import useUserData from '../../../hooks/useUserData';
import {getLibsQuery, LibrariesQuery} from '../../../queries/libraries/getLibrariesQuery';
import {addWildcardToFilters} from '../../../utils/utils';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import LibrariesList from '../LibrariesList';

interface ILibrariesProps extends WithNamespaces {
    history: History;
}

function Libraries({t, history}: ILibrariesProps): JSX.Element {
    const {lang} = useLang();
    const userData = useUserData();
    const [filters, setFilters] = useState<any>({});

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
        <React.Fragment>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <Header size="large">
                        <Icon name="folder outline" />
                        {t('libraries.title')}
                    </Header>
                </Grid.Column>
                {userData.permissions[PermissionsActions.admin_create_library] && (
                    <Grid.Column floated="right" width={3} textAlign="right" verticalAlign="middle">
                        <Button icon labelPosition="left" size="medium" as={Link} to={'/libraries/edit'}>
                            <Icon name="plus" />
                            {t('libraries.new')}
                        </Button>
                    </Grid.Column>
                )}
            </Grid>
            <LibrariesQuery query={getLibsQuery} variables={{...addWildcardToFilters(filters), lang}}>
                {({loading, error, data}) => {
                    if (typeof error !== 'undefined') {
                        return <p>Error: {error.message}</p>;
                    }

                    const onRowClick = library => history.push('/libraries/edit/' + library.id);

                    return (
                        <LibrariesList
                            loading={loading || !data}
                            libraries={data ? data.libraries : []}
                            onRowClick={onRowClick}
                            onFiltersUpdate={_onFiltersUpdate}
                            filters={filters}
                        />
                    );
                }}
            </LibrariesQuery>
        </React.Fragment>
    );
}

export default withNamespaces()(Libraries);
