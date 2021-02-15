// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getAttributesByLibQuery = gql`
    query GET_ATTRIBUTES_BY_LIB($library: String!) {
        attributes(filters: {libraries: [$library]}) {
            list {
                id
                type
                format
                label
                multiple_values
                ... on LinkAttribute {
                    linked_library {
                        id
                    }
                }
                ... on TreeAttribute {
                    linked_tree {
                        id
                    }
                }
                ... on StandardAttribute {
                    embedded_fields {
                        id
                        format
                        label
                    }
                }
            }
        }
    }
`;
