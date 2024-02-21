// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const recordFormAttributeFragment = gql`
    fragment RecordFormAttribute on Attribute {
        id
        label
        description
        type
        format
        system
        readonly
        multiple_values
        permissions(record: {id: $recordId, library: $libraryId}) {
            access_attribute
            edit_value
        }
        versions_conf {
            versionable
            profile {
                id
                trees {
                    id
                    label
                }
            }
        }
        metadata_fields {
            id
            label
            description
            type
            format
            system
            readonly
            multiple_values
            permissions(record: {id: $recordId, library: $libraryId}) {
                access_attribute
                edit_value
            }
            values_list {
                ...StandardValuesListFragment
            }
            metadata_fields {
                id
            }
        }

        ... on StandardAttribute {
            values_list {
                ...StandardValuesListFragment
            }
        }

        ... on LinkAttribute {
            linked_library {
                id
                label
                behavior
                permissions {
                    create_record
                }
            }
            linkValuesList: values_list {
                enable
                allowFreeEntry
                values {
                    ...RecordIdentity
                }
            }
        }

        ... on TreeAttribute {
            linked_tree {
                id
                label
            }
            treeValuesList: values_list {
                enable
                allowFreeEntry
                values {
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
