import gql from 'graphql-tag';
import * as React from 'react';
import {Query} from 'react-apollo';
import {Link} from 'react-router-dom';
import {Header, Icon, List} from 'semantic-ui-react';
import {GET_LIBRARIES, GET_LIBRARIES_libraries} from './_types/GET_LIBRARIES';

const libsQuery = gql`
    query GET_LIBRARIES {
        libraries {
            id
            label {
                fr
                en
            }
        }
    }
`;

class LibrariesQuery extends Query<GET_LIBRARIES> {}

function Libraries() {
    return (
        <div>
            <Header size="large">
                <Icon name="folder outline" />
                Libraries
            </Header>
            <LibrariesQuery query={libsQuery}>
                {({loading, error, data}) => {
                    if (loading || !data) {
                        return <p>Loading</p>;
                    }
                    if (typeof error !== 'undefined') {
                        return <p>Error: {error.message}</p>;
                    }

                    return (
                        <List divided relaxed>
                            {data.libraries === null ? (
                                <p>No Libraries</p>
                            ) : (
                                data.libraries.map((l: GET_LIBRARIES_libraries) => {
                                    const label = l.label !== null ? l.label.fr || l.label.en : l.id;
                                    return (
                                        <List.Item as={Link} to="/libraries" key={l.id}>
                                            <List.Icon name="book" size="large" />
                                            <List.Content>
                                                <List.Header size="huge">{label}</List.Header>
                                                <List.Description>{l.id}</List.Description>
                                            </List.Content>
                                        </List.Item>
                                    );
                                })
                            )}
                        </List>
                    );
                }}
            </LibrariesQuery>
        </div>
    );
}

export default Libraries;
