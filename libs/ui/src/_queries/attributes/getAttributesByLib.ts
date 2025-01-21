// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getAttributesByLibQuery = gql`
    query GET_ATTRIBUTES_BY_LIB($library: String!) {
        attributes(filters: {libraries: [$library]}) {
            list {
                ...AttributesByLibAttribute
            }
        }
    }

    fragment AttributesByLibLinkAttribute on LinkAttribute {
        linked_library {
            id
        }
    }

    fragment AttributesByLibAttribute on Attribute {
        id
        type
        format
        label
        multiple_values
        system
        readonly
        ...AttributesByLibLinkAttribute
        ... on TreeAttribute {
            linked_tree {
                id
                label
                libraries {
                    library {
                        id
                        label
                    }
                }
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
`;
