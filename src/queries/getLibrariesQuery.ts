import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {GET_LIBRARIES} from '../_types/GET_LIBRARIES';

export const getLibsQuery = gql`
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

export class LibrariesQuery extends Query<GET_LIBRARIES> {}
