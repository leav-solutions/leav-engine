// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getFormQuery = gql`
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

                            ... on LinkAttribute {
                                linked_library {
                                    id
                                    gqlNames {
                                        type
                                    }
                                }
                            }

                            ... on TreeAttribute {
                                linked_tree {
                                    id
                                    label
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
