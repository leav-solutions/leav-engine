// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {attributeDetailsFragment} from './attributeFragments';

// This const is useful to refer this query in refetchQueries on mutations.
// Warning, Using it in gql template below will cause the CLI types generator to fail
export const getAttributesQueryName = 'GET_ATTRIBUTES';

export const getAttributesQuery = gql`
    ${attributeDetailsFragment}
    query GET_ATTRIBUTES(
        $id: ID
        $label: String
        $type: [AttributeType]
        $format: [AttributeFormat]
        $system: Boolean
        $multiple_values: Boolean
        $versionable: Boolean
        $libraries: [String!]
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
                libraries: $libraries
            }
        ) {
            totalCount
            list {
                ...AttributeDetails
            }
        }
    }
`;
