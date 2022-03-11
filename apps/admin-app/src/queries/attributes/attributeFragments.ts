// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const attributeDetailsFragment = gql`
    fragment AttributeDetails on Attribute {
        id
        type
        format
        system
        label
        description
        multiple_values
        metadata_fields {
            id
            label
            type
            format
        }
        permissions_conf {
            permissionTreeAttributes {
                id
                label
                ... on TreeAttribute {
                    linked_tree {
                        id
                    }
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
            linked_library {
                id
            }
        }
        ... on TreeAttribute {
            linked_tree {
                id
            }
        }
    }
`;

export const attributeValuesListDetailsFragment = gql`
    fragment AttributeValuesListDetails on Attribute {
        ... on StandardAttribute {
            values_list {
                ... on StandardStringValuesListConf {
                    enable
                    allowFreeEntry
                    values
                }

                ... on StandardDateRangeValuesListConf {
                    enable
                    allowFreeEntry
                    dateRangeValues: values {
                        from
                        to
                    }
                }
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
                        preview {
                            small
                            medium
                            pages
                            big
                        }
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
                            preview {
                                small
                                medium
                                pages
                                big
                            }
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
                                preview {
                                    small
                                    medium
                                    pages
                                    big
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;
