// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {recordIdentityFragment} from 'queries/records/recordIdentityFragment';

export const attributeDetailsFragment = gql`
    fragment AttributeDetails on Attribute {
        id
        type
        format
        system
        readonly
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
`;

export const attributeValuesListDetailsFragment = gql`
    ${recordIdentityFragment}
    fragment AttributeValuesListDetails on Attribute {
        ... on StandardAttribute {
            unique
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
                    ...RecordIdentity
                }
            }
        }
        ... on TreeAttribute {
            values_list {
                enable
                allowFreeEntry
                treeValues: values {
                    record {
                        ...RecordIdentity
                    }
                    ancestors {
                        record {
                            ...RecordIdentity
                        }
                    }
                }
            }
        }
    }
`;
