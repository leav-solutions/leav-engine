import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {GET_LIBRARIES, GET_LIBRARIESVariables} from 'src/_gqlTypes/GET_LIBRARIES';
import {attributeDetailsFragment} from '../attributes/attributeFragments';

export const getLibsQuery = gql`
    ${attributeDetailsFragment}
    query GET_LIBRARIES($id: ID, $label: String, $system: Boolean, $lang: [AvailableLanguage!]) {
        libraries(id: $id, label: $label, system: $system) {
            id
            system
            label
            attributes {
                ...AttributeDetails
            }
            recordIdentityConf {
                label
                color
                preview
            }
        }
    }
`;

export class LibrariesQuery extends Query<GET_LIBRARIES, GET_LIBRARIESVariables> {}
