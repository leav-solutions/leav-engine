// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {History} from 'history';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import useUserData from '../../../hooks/useUserData';
import {getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {addWildcardToFilters} from '../../../utils/utils';
import {GET_ATTRIBUTES, GET_ATTRIBUTESVariables} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {PermissionsActions} from '../../../_gqlTypes/globalTypes';
import AttributesList from '../AttributesList';
import DeleteAttribute from '../DeleteAttribute';

interface IAttributesProps {
    history: History;
}

interface IAttributesFilters {
    id?: string;
    label?: string;
    multiple_values?: boolean;
    isSystem?: boolean;
}

const Attributes = (props: IAttributesProps): JSX.Element => {
    const {t} = useTranslation();
    const {history} = props;
    const [filters, setFilters] = useState<IAttributesFilters>({});
    const userData = useUserData();

    const {loading, error, data} = useQuery<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(getAttributesQuery, {
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

    const _onRowClick = attribute => history.push('/attributes/edit/' + attribute.id);

    return (
        <div>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <Header size="large">
                        <Icon name="cubes" />
                        {t('attributes.title')}
                    </Header>
                </Grid.Column>
                {userData.permissions[PermissionsActions.app_create_attribute] && (
                    <Grid.Column floated="right" width={3} textAlign="right" verticalAlign="middle">
                        <Button icon labelPosition="left" size="medium" as={Link} to={'/attributes/edit/'}>
                            <Icon name="plus" />
                            {t('attributes.new')}
                        </Button>
                    </Grid.Column>
                )}
            </Grid>
            {!error ? (
                <AttributesList
                    loading={loading || !data}
                    attributes={data && data.attributes ? data.attributes.list : []}
                    onRowClick={_onRowClick}
                    onFiltersUpdate={_onFiltersUpdate}
                    filters={filters}
                    actions={
                        userData.permissions[PermissionsActions.app_delete_attribute] ? (
                            <DeleteAttribute key="delete_attr" filters={filters} />
                        ) : (
                            <></>
                        )
                    }
                />
            ) : (
                <p>Error: {error.message}</p>
            )}
        </div>
    );
};

export default Attributes;
