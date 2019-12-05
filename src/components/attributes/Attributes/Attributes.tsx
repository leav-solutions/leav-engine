import {History} from 'history';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import useLang from '../../../hooks/useLang';
import useUserData from '../../../hooks/useUserData';
import {AttributesQuery, getAttributesQuery} from '../../../queries/attributes/getAttributesQuery';
import {addWildcardToFilters} from '../../../utils/utils';
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

/* tslint:disable-next-line:variable-name */
const Attributes = (props: IAttributesProps): JSX.Element => {
    const {t} = useTranslation();
    const {history} = props;
    const {lang} = useLang();
    const [filters, setFilters] = useState<IAttributesFilters>({});
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
        <div>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <Header size="large">
                        <Icon name="folder outline" />
                        {t('attributes.title')}
                    </Header>
                </Grid.Column>
                {userData.permissions[PermissionsActions.admin_create_attribute] && (
                    <Grid.Column floated="right" width={3} textAlign="right" verticalAlign="middle">
                        <Button icon labelPosition="left" size="medium" as={Link} to={'/attributes/edit/'}>
                            <Icon name="plus" />
                            {t('attributes.new')}
                        </Button>
                    </Grid.Column>
                )}
            </Grid>
            <AttributesQuery query={getAttributesQuery} variables={{...addWildcardToFilters(filters), lang}}>
                {({loading, error, data}) => {
                    if (typeof error !== 'undefined') {
                        return <p>Error: {error.message}</p>;
                    }

                    const onRowClick = attribute => history.push('/attributes/edit/' + attribute.id);

                    return (
                        <AttributesList
                            loading={loading || !data}
                            attributes={data && data.attributes ? data.attributes.list : []}
                            onRowClick={onRowClick}
                            onFiltersUpdate={_onFiltersUpdate}
                            filters={filters}
                            actions={
                                userData.permissions[PermissionsActions.admin_delete_attribute] ? (
                                    <DeleteAttribute key="delete_attr" />
                                ) : (
                                    <></>
                                )
                            }
                        />
                    );
                }}
            </AttributesQuery>
        </div>
    );
};

export default Attributes;
