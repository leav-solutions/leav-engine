import {Query} from '@apollo/react-components';
import gql from 'graphql-tag';
import {GET_ATTRIBUTES, GET_ATTRIBUTESVariables} from '../../_gqlTypes/GET_ATTRIBUTES';
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
        $multiple_values: Boolean
        $versionable: Boolean
    ) {
        attributes(
            filters: {
                id: $id
                label: $label
                type: $type
                format: $format
                system: $system
                multiple_values: $multiple_values
                versionable: $versionable
            }
        ) {
            totalCount
            list {
                ...AttributeDetails
            }
        }
    }
`;

/* tslint:disable-next-line:variable-name */
export const AttributesQuery = p => Query<GET_ATTRIBUTES, GET_ATTRIBUTESVariables>(p);
