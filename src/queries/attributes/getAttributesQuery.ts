import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {GET_ATTRIBUTES, GET_ATTRIBUTESVariables} from 'src/_gqlTypes/GET_ATTRIBUTES';
import {attributeDetailsFragment} from './attributeFragments';

// This const is useful to refer this query in refetchQueries on mutations.
// Warning, Using it in gql template below will cause the CLI types generator to fail
export const getAttributesQueryName = 'GET_ATTRIBUTES';

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
