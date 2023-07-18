// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import recordIdentityFragment from '../records/recordIdentityFragment';
import {valuesVersionDetailsFragment} from '../values/valuesVersionFragment';

export const getRecordFormQuery = gql`
    ${recordIdentityFragment}
    ${valuesVersionDetailsFragment}

    fragment StandardValuesListFragment on StandardValuesListConf {
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

    query RECORD_FORM($libraryId: String!, $formId: String!, $recordId: String, $version: [ValueVersionInput!]) {
        recordForm(recordId: $recordId, libraryId: $libraryId, formId: $formId, version: $version) {
            id
            recordId
            library {
                id
            }
            dependencyAttributes {
                id
            }
            elements {
                id
                containerId
                uiElementType
                type
                valueError
                values {
                    id_value
                    created_at
                    modified_at
                    created_by {
                        ...RecordIdentity
                    }
                    modified_by {
                        ...RecordIdentity
                    }
                    metadata {
                        name
                        value {
                            id_value
                            value
                            raw_value
                        }
                    }

                    version {
                        ...ValuesVersionDetails
                    }

                    ... on Value {
                        value
                        raw_value
                    }

                    ... on LinkValue {
                        linkValue: value {
                            ...RecordIdentity
                        }
                    }

                    ... on TreeValue {
                        treeValue: value {
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
                attribute {
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
                            gqlNames {
                                type
                                query
                            }
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
                settings {
                    key
                    value
                }
            }
        }
    }
`;
