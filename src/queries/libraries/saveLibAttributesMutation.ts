import gql from 'graphql-tag';
import {Mutation} from 'react-apollo';
import {SAVE_LIBRARY_ATTRIBUTES, SAVE_LIBRARY_ATTRIBUTESVariables} from '../../_gqlTypes/SAVE_LIBRARY_ATTRIBUTES';
import {attributeDetailsFragment} from '../attributes/attributeFragments';

export const saveLibAttributesMutation = gql`
    ${attributeDetailsFragment}
    mutation SAVE_LIBRARY_ATTRIBUTES($libId: ID!, $attributes: [ID!]!, $lang: [AvailableLanguage!]) {
        saveLibrary(library: {id: $libId, attributes: $attributes}) {
            id
            attributes {
                ...AttributeDetails
            }
        }
    }
`;

export class SaveLibAttributesMutation extends Mutation<SAVE_LIBRARY_ATTRIBUTES, SAVE_LIBRARY_ATTRIBUTESVariables> {}
