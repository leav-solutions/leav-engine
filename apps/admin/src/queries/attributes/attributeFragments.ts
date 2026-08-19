import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const attributeDetailsFragment = gql`
    fragment AttributeDetails on Attribute {
        id
        type
        format
        system
        readonly
        required
        label
        description
        multiple_values
        multi_link_display_option
        multi_tree_display_option
        column_split_enabled
        metadata_fields {
            id
            label
            type
            format
        }
        settings
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
            character_limit
            smart_filter {
                enable
            }
            values_list {
                ... on StandardStringValuesListConf {
                    enable
                    allowFreeEntry
                }
            }
        }

        ... on LinkAttribute {
            linked_library {
                id
            }
            reverse_link
            smart_filter {
                enable
            }
            values_list {
                enable
                allowFreeEntry
            }
        }
        ... on TreeAttribute {
            linked_tree {
                id
            }
            tree_selection_conf {
                selectableNodes
                defaultExpanded
                displayRootNode
                maxDepth
                showSelectChildrenButton
                showSelectDescendantsButton
            }
            permissions_conf_dependent_values {
                dependenciesTreeAttributes {
                    id
                    label
                    ... on TreeAttribute {
                        linked_tree {
                            id
                        }
                    }
                }
                allowByDefault
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
                    allowListUpdate
                    values
                }

                ... on StandardDateRangeValuesListConf {
                    enable
                    allowFreeEntry
                    allowListUpdate
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
                allowListUpdate
                linkValues: values {
                    ...RecordIdentity
                }
            }
        }
        ... on TreeAttribute {
            values_list {
                enable
                allowFreeEntry
                allowListUpdate
                treeValues: values {
                    id
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
