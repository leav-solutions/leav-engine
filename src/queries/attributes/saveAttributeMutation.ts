import gql from 'graphql-tag';

export const saveAttributeQuery = gql`
    mutation SAVE_ATTRIBUTE($attrData: AttributeInput!) {
        saveAttribute(attribute: $attrData) {
            id
            type
            format
            system
            label
            linked_library
            linked_tree
            multiple_values
            permissions_conf {
                permissionTreeAttributes {
                    id
                    linked_tree
                    label
                }
                relation
            }
            versions_conf {
                versionable
                mode
                trees
            }
        }
    }
`;
