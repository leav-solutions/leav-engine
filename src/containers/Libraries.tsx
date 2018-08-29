import * as React from 'react';
import {Link} from 'react-router-dom';
import {Button, Grid, Header, Icon} from 'semantic-ui-react';
import LibrariesList from '../components/LibrariesList';
import {getLibsQuery, LibrariesQuery} from '../queries/getLibrariesQuery';

function Libraries() {
    return (
        <div>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <Header size="large">
                        <Icon name="folder outline" />
                        Libraries
                    </Header>
                </Grid.Column>
                <Grid.Column floated="right" width={3} textAlign="right" verticalAlign="middle">
                    <Button icon labelPosition="left" size="medium" as={Link} to={'/edit-library'}>
                        <Icon name="plus" />
                        New library
                    </Button>
                </Grid.Column>
            </Grid>
            <LibrariesQuery query={getLibsQuery}>
                {({loading, error, data}) => {
                    if (loading || !data) {
                        return <p>Loading</p>;
                    }
                    if (typeof error !== 'undefined') {
                        return <p>Error: {error.message}</p>;
                    }

                    return <LibrariesList libraries={data.libraries} />;
                }}
            </LibrariesQuery>
        </div>
    );
}

export default Libraries;
