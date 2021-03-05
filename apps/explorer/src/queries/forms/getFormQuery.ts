// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getFormQuery = gql`
    query GET_FORM($library: ID!, $formId: ID!) {
        forms(filters: {library: $library, id: $formId}) {
            list {
                id
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
