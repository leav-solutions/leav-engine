import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {GET_LIBRARIES} from '../_gqlTypes/GET_LIBRARIES';

export const getLibsQuery = gql`
    query GET_LIBRARIES($id: ID) {
        libraries(id: $id) {
            id
            system
            label {
                fr
                en
            }
        }
    }
`;

export class LibrariesQuery extends Query<GET_LIBRARIES> {}
