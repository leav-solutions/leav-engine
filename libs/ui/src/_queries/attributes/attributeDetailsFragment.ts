// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const attributeDetailsFragment = gql`
    fragment AttributeDetails on Attribute {
        id
        type
        format
        system
        readonly
        label
        required
        description
        multiple_values
        metadata_fields {
            id
            label
            type
            format
        }
        versions_conf {
            versionable
            mode
            profile {
                id
                label
                trees {
                    id
                    label
                }
            }
        }
        libraries {
            id
            label
        }

        ... on StandardAttribute {
            unique
            maxLength
        }

        ... on LinkAttribute {
            linked_library {
                id
                label
            }
            reverse_link
        }
        ... on TreeAttribute {
            linked_tree {
                id
                label
            }
        }
    }
`;
