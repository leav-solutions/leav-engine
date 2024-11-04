// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getAttributesQuery = gql`
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
                id
                label
                type
                format
                system
                multiple_values
                ... on StandardAttribute {
                    unique
                }
                ... on LinkAttribute {
                    linked_library {
                        id
                    }
                    reverse_link
                }
                ... on TreeAttribute {
                    linked_tree {
                        id
                    }
                }
            }
        }
    }
`;
