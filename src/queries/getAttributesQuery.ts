import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {GET_ATTRIBUTES, GET_ATTRIBUTESVariables} from '../_gqlTypes/GET_ATTRIBUTES';
import {attributeDetailsFragment} from './attributeFragments';

export const getAttributesQuery = gql`
    ${attributeDetailsFragment}
    query GET_ATTRIBUTES(
        $lang: [AvailableLanguage!]
        $id: ID
        $label: String
        $type: [AttributeType]
        $format: [AttributeFormat]
        $system: Boolean
    ) {
        attributes(id: $id, label: $label, type: $type, format: $format, system: $system) {
            ...AttributeDetails
        }
    }
`;

export class AttributesQuery extends Query<GET_ATTRIBUTES, GET_ATTRIBUTESVariables> {}
