import gql from 'graphql-tag';

export const saveAttributeActionsListMutation = gql`
    mutation SAVE_ATTRIBUTE_ACTION_LIST($att: AttributeInput!) {
        saveAttribute(attribute: $att) {
            id
            actions_list {
                saveValue {
                    name
                    params {
                        name
                        value
                    }
                }
                getValue {
                    name
                    params {
                        name
                        value
                    }
                }
                deleteValue {
                    name
                    params {
                        name
                        value
                    }
                }
            }
        }
    }
`;
