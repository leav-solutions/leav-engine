import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {GET_LIBRARIES, GET_LIBRARIESVariables} from '../_gqlTypes/GET_LIBRARIES';
import {attributeDetailsFragment} from './attributeFragments';

export const getLibsQuery = gql`
    ${attributeDetailsFragment}
    query GET_LIBRARIES($id: ID, $lang: [AvailableLanguage!]) {
        libraries(id: $id) {
            id
            system
            label
            attributes {
                ...AttributeDetails
            }
        }
    }
`;

export class LibrariesQuery extends Query<GET_LIBRARIES, GET_LIBRARIESVariables> {}
