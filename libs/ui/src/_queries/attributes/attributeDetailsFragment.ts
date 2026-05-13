import {gql} from '@apollo/client';

export const attributeDetailsFragment = gql`
    fragment AttributeDetails on Attribute {
        id
        type
        format
        system
        readonly
        label
        description
        required
        multiple_values
        multi_link_display_option
        multi_tree_display_option
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
            smart_filter {
                enable
            }
        }

        ... on LinkAttribute {
            linked_library {
                id
                label
            }
            reverse_link
            smart_filter {
                enable
                through {
                    id
                }
            }
        }
        ... on TreeAttribute {
            linked_tree {
                id
                label
            }
            permissions_conf_dependent_values {
                dependenciesTreeAttributes {
                    id
                }
            }
        }
    }
`;
