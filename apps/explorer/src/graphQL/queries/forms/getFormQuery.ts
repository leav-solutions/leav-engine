// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import recordIdentityFragment from '../records/recordIdentityFragment';

export const getFormQuery = gql`
    ${recordIdentityFragment}
    query GET_FORM($library: ID!, $formId: ID!) {
        forms(filters: {library: $library, id: $formId}) {
            list {
                id
                library {
                    id
                }
                dependencyAttributes {
                    id
                    label
                }
                elements {
                    dependencyValue {
                        attribute
                        value {
                            id
                            library
                        }
                    }
                    elements {
                        id
                        containerId
                        uiElementType
                        type
                        attribute {
                            id
                            label
                            type
                            format
                            system
                            multiple_values

                            ... on StandardAttribute {
                                values_list {
                                    enable
                                    allowFreeEntry
                                    values
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
        }
    }
`;
