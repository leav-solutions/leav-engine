// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import recordIdentityFragment from '../records/recordIdentityFragment';

export const getRecordFormQuery = gql`
    ${recordIdentityFragment}

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

    query RECORD_FORM($libraryId: String!, $formId: String!, $recordId: String) {
        recordForm(recordId: $recordId, libraryId: $libraryId, formId: $formId) {
            id
            recordId
            library {
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
                            value
                            raw_value
                        }
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
                    metadata_fields {
                        id
                        label
                        description
                        type
                        format
                        system
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
                            gqlNames {
                                type
                                query
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
