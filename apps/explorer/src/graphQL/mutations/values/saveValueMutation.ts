// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from 'graphql-tag';

export const saveValueMutation = gql`
    mutation SAVE_VALUE($library: ID!, $recordId: ID!, $attribute: ID!, $value: ValueInput!) {
        saveValue(library: $library, recordId: $recordId, attribute: $attribute, value: $value) {
            id_value
            modified_at
            created_at

            ... on Value {
                value
                raw_value
            }

            ... on LinkValue {
                linkValue: value {
                    id
                    whoAmI {
                        id
                        label
                        color
                        library {
                            id
                            label
                            gqlNames {
                                query
                                type
                            }
                        }
                        preview {
                            small
                            medium
                            big
                            pages
                        }
                    }
                }
            }
        }
    }
`;
