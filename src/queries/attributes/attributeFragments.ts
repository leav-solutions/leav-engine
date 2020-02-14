import gql from 'graphql-tag';

export const attributeDetailsFragment = gql`
    fragment AttributeDetails on Attribute {
        id
        type
        format
        system
        label(lang: $lang)
        multiple_values
        metadata_fields {
            id
            label(lang: $lang)
            type
            format
        }
        permissions_conf {
            permissionTreeAttributes {
                id
                label(lang: $lang)
                ... on TreeAttribute {
                    linked_tree
                }
            }
            relation
        }
        versions_conf {
            versionable
            mode
            trees
        }
        ... on LinkAttribute {
            linked_library
        }
        ... on TreeAttribute {
            linked_tree
        }
    }
`;

export const attributeValuesListDetailsFragment = gql`
    fragment AttributeValuesListDetails on Attribute {
        ... on StandardAttribute {
            values_list {
                enable
                allowFreeEntry
                values
            }
        }
        ... on LinkAttribute {
            values_list {
                enable
                allowFreeEntry
                linkValues: values {
                    whoAmI {
                        id
                        library {
                            id
                            label
                        }
                        label
                        color
                        preview
                    }
                }
            }
        }
        ... on TreeAttribute {
            values_list {
                enable
                allowFreeEntry
                treeValues: values {
                    record {
                        whoAmI {
                            id
                            library {
                                id
                                label
                            }
                            label
                            color
                            preview
                        }
                    }
                    ancestors {
                        record {
                            whoAmI {
                                id
                                library {
                                    id
                                    label
                                }
                                label
                                color
                                preview
                            }
                        }
                    }
                }
            }
        }
    }
`;
