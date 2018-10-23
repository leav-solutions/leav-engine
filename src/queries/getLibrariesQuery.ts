import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {GET_LIBRARIES} from '../_gqlTypes/GET_LIBRARIES';
import {attributeDetailsFragment} from './attributeFragments';

export const getLibsQuery = gql`
    ${attributeDetailsFragment}
    query GET_LIBRARIES($id: ID) {
        libraries(id: $id) {
            id
            system
            label {
                fr
                en
            }
            attributes {
                ...AttributeDetails
            }
        }
    }
`;

export class LibrariesQuery extends Query<GET_LIBRARIES> {}
