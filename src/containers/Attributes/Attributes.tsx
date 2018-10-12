import {History} from 'history';
import * as React from 'react';
import {translate, TranslationFunction} from 'react-i18next';
import {Link} from 'react-router-dom';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import AttributesList from '../../components/AttributesList';
import Loading from '../../components/Loading';
import {AttributesQuery, getAttributesQuery} from '../../queries/getAttributesQuery';

interface IAttributesProps {
    t: TranslationFunction;
    history: History;
}

function Attributes({t, history}: IAttributesProps) {
    return (
        <div>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <Header size="large">
                        <Icon name="folder outline" />
                        {t('attributes.title')}
                    </Header>
                </Grid.Column>
                <Grid.Column floated="right" width={3} textAlign="right" verticalAlign="middle">
                    <Button icon labelPosition="left" size="medium" as={Link} to={'/attributes/edit/'}>
                        <Icon name="plus" />
                        {t('attributes.new')}
                    </Button>
                </Grid.Column>
            </Grid>
            <AttributesQuery query={getAttributesQuery}>
                {({loading, error, data}) => {
                    if (loading || !data) {
                        return <Loading />;
                    }
                    if (typeof error !== 'undefined') {
                        return <p>Error: {error.message}</p>;
                    }

                    const onRowClick = attribute => history.push('/attributes/edit/' + attribute.id);

                    return <AttributesList attributes={data.attributes} onRowClick={onRowClick} />;
                }}
            </AttributesQuery>
        </div>
    );
}

export default translate()(Attributes);
