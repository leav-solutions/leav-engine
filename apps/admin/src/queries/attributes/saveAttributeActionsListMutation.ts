import {gql} from '@apollo/client';

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
                    error_message
                }
                postSaveValue {
                    id
                    params {
                        name
                        value
                    }
                    error_message
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
                postDeleteValue {
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
