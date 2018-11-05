import {History} from 'history';
import {i18n} from 'i18next';
import * as React from 'react';
import {translate, TranslationFunction} from 'react-i18next';
import {Link} from 'react-router-dom';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import {getSysTranslationQueryLanguage} from 'src/utils/utils';
import LibrariesList from '../../components/LibrariesList';
import {getLibsQuery, LibrariesQuery} from '../../queries/getLibrariesQuery';

interface ILibrariesProps {
    t: TranslationFunction;
    i18n: i18n;
    history: History;
}

interface ILibrariesState {
    filters: any;
}

class Libraries extends React.Component<ILibrariesProps, ILibrariesState> {
    constructor(props: ILibrariesProps) {
        super(props);

        this.state = {
            filters: {}
        };
    }

    public render() {
        const {i18n: i18next} = this.props;
        const {filters} = this.state;

        const lang = getSysTranslationQueryLanguage(i18next);

        return (
            <div>
                <Grid>
                    <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                        <Header size="large">
                            <Icon name="folder outline" />
                            {this.props.t('libraries.title')}
                        </Header>
                    </Grid.Column>
                    <Grid.Column floated="right" width={3} textAlign="right" verticalAlign="middle">
                        <Button icon labelPosition="left" size="medium" as={Link} to={'/libraries/edit'}>
                            <Icon name="plus" />
                            {this.props.t('libraries.new')}
                        </Button>
                    </Grid.Column>
                </Grid>
                <LibrariesQuery query={getLibsQuery} variables={{...filters, lang}}>
                    {({loading, error, data}) => {
                        if (typeof error !== 'undefined') {
                            return <p>Error: {error.message}</p>;
                        }

                        const onRowClick = library => this.props.history.push('/libraries/edit/' + library.id);

                        return (
                            <LibrariesList
                                loading={loading || !data}
                                libraries={data ? data.libraries : []}
                                onRowClick={onRowClick}
                                onFiltersUpdate={this._onFiltersUpdate}
                                filters={filters}
                            />
                        );
                    }}
                </LibrariesQuery>
            </div>
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

export default translate()(Libraries);
