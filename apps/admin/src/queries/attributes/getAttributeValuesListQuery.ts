// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {attributeValuesListDetailsFragment} from './attributeFragments';

export const getAttributeValuesListQuery = gql`
    ${attributeValuesListDetailsFragment}
    query GET_ATTRIBUTES_VALUES_LIST($attrId: ID!) {
        attributes(filters: {id: $attrId}) {
            list {
                id
                label
                type
                format
                ...AttributeValuesListDetails
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
