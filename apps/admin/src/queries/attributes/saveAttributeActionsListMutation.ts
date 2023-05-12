// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const saveAttributeActionsListMutation = gql`
    mutation SAVE_ATTRIBUTE_ACTION_LIST($att: AttributeInput!) {
        saveAttribute(attribute: $att) {
            id
            actions_list {
                saveValue {
                    id
                    params {
                        name
                        value
                    }
                }
                getValue {
                    id
                    params {
                        name
                        value
                    }
                }
                deleteValue {
                    id
                    params {
                        name
                        value
                    }
                }
            }
        }
    }
`;
