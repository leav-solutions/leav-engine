import {History} from 'history';
import * as React from 'react';
import {translate, TranslationFunction} from 'react-i18next';
import {Link} from 'react-router-dom';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import AttributesList from '../../components/AttributesList';
import {AttributesQuery, getAttributesQuery} from '../../queries/getAttributesQuery';
import DeleteAttribute from '../DeleteAttribute';

interface IAttributesProps {
    t: TranslationFunction;
    history: History;
}

interface IAttributesState {
    filters: any;
}

class Attributes extends React.Component<IAttributesProps, IAttributesState> {
    constructor(props: IAttributesProps) {
        super(props);

        this.state = {
            filters: {}
        };
    }

    public render = () => {
        const {t, history} = this.props;
        const {filters} = this.state;

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
                <AttributesQuery query={getAttributesQuery} variables={this.state.filters}>
                    {({loading, error, data}) => {
                        if (typeof error !== 'undefined') {
                            return <p>Error: {error.message}</p>;
                        }

                        const onRowClick = attribute => history.push('/attributes/edit/' + attribute.id);

                        return (
                            <AttributesList
                                loading={loading || !data}
                                attributes={data ? data.attributes : []}
                                onRowClick={onRowClick}
                                onFiltersUpdate={this._onFiltersUpdate}
                                filters={filters}
                            >
                                <DeleteAttribute key="delete_attr" />
                            </AttributesList>
                        );
                    }}
                </AttributesQuery>
            </div>
        );
    }

    private _onFiltersUpdate = (filterElem: any) => {
        this.setState({
            filters: {
                ...this.state.filters,
                [filterElem.name]: filterElem.type === 'checkbox' ? filterElem.checked : filterElem.value
            }
        });
    }
}

export default translate()(Attributes);
