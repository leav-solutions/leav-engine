import gql from 'graphql-tag';
import * as React from 'react';
import {Query} from 'react-apollo';
import {Header, Icon} from 'semantic-ui-react';
import LibrariesList from '../components/LibrariesList';
import {GET_LIBRARIES} from '../_types/GET_LIBRARIES';

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

                    return <LibrariesList libraries={data.libraries} />;
                }}
            </LibrariesQuery>
        </div>
    );
}

export default Libraries;
