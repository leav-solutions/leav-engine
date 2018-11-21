import {History} from 'history';
import * as React from 'react';
import {WithNamespaces, withNamespaces} from 'react-i18next';
import {Link} from 'react-router-dom';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import {getTreesQuery, TreesQuery} from 'src/queries/getTreesQuery';
import {addWildcardToFilters, getSysTranslationQueryLanguage} from 'src/utils/utils';
import {GET_TREESVariables} from 'src/_gqlTypes/GET_TREES';
import TreesList from '../TreesList';

interface ITreesProps extends WithNamespaces {
    history: History;
}

interface ITreesState {
    filters: Partial<GET_TREESVariables>;
}

class Trees extends React.Component<ITreesProps, ITreesState> {
    constructor(props: ITreesProps) {
        super(props);

        this.state = {
            filters: {}
        };
    }

    public render() {
        const {t, i18n: i18next} = this.props;
        const {filters} = this.state;
        const lang = getSysTranslationQueryLanguage(i18next);
        return (
            <React.Fragment>
                <Grid>
                    <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                        <Header size="large">
                            <Icon name="share alternate" />
                            {t('trees.title')}
                        </Header>
                    </Grid.Column>
                    <Grid.Column floated="right" width={3} textAlign="right" verticalAlign="middle">
                        <Button icon labelPosition="left" size="medium" as={Link} to={'/trees/edit/'}>
                            <Icon name="plus" />
                            {t('trees.new')}
                        </Button>
                    </Grid.Column>
                </Grid>
                <TreesQuery query={getTreesQuery} variables={{...addWildcardToFilters(filters), lang}}>
                    {({loading, error, data}) => {
                        if (typeof error !== 'undefined') {
                            return <p>Error: {error.message}</p>;
                        }

                        const onRowClick = tree => this.props.history.push('/trees/edit/' + tree.id);

                        return (
                            <TreesList
                                trees={data ? data.trees : null}
                                onRowClick={onRowClick}
                                onFiltersUpdate={this._onFiltersUpdate}
                                filters={filters}
                                loading={loading}
                            />
                        );
                    }}
                </TreesQuery>
            </React.Fragment>
        );
    }

    private _onFiltersUpdate = (filterElem: any) => {
        const newElemState =
            filterElem.type === 'checkbox'
                ? filterElem.indeterminate
                    ? undefined
                    : filterElem.checked
                : filterElem.value;

        this.setState({
            filters: {
                ...this.state.filters,
                [filterElem.name]: newElemState
            }
        });
    }
}

export default withNamespaces()(Trees);
