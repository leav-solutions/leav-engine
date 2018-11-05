import {History} from 'history';
import * as React from 'react';
import {translate, TranslationFunction} from 'react-i18next';
import {Link} from 'react-router-dom';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import LibrariesList from '../../components/LibrariesList';
import Loading from '../../components/Loading';
import {getLibsQuery, LibrariesQuery} from '../../queries/getLibrariesQuery';

interface ILibrariesProps {
    t: TranslationFunction;
    history: History;
}

function Libraries({t, history}: ILibrariesProps) {
    return (
        <div>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <Header size="large">
                        <Icon name="folder outline" />
                        {t('libraries.title')}
                    </Header>
                </Grid.Column>
                <Grid.Column floated="right" width={3} textAlign="right" verticalAlign="middle">
                    <Button icon labelPosition="left" size="medium" as={Link} to={'/libraries/edit'}>
                        <Icon name="plus" />
                        {t('libraries.new')}
                    </Button>
                </Grid.Column>
            </Grid>
            <LibrariesQuery query={getLibsQuery}>
                {({loading, error, data}) => {
                    if (loading || !data) {
                        return <Loading />;
                    }
                    if (typeof error !== 'undefined') {
                        return <p>Error: {error.message}</p>;
                    }

                    const onRowClick = library => history.push('/libraries/edit/' + library.id);

                    return <LibrariesList libraries={data.libraries} onRowClick={onRowClick} />;
                }}
            </LibrariesQuery>
        </div>
    );
}

export default translate()(Libraries);
