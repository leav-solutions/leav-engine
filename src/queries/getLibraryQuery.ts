import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {GET_LIBRARY, GET_LIBRARYVariables} from '../_types/GET_LIBRARY';

export const getLibQuery = gql`
    query GET_LIBRARY($id: ID!) {
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

export class LibraryQuery extends Query<GET_LIBRARY, GET_LIBRARYVariables> {}
