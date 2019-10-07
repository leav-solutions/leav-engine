import gql from 'graphql-tag';

export const getAvailableActionsQuery = gql`
    query GET_AVAILABLE_ACTIONS {
        availableActions {
            name
            description
            input_types
            output_types
            params {
                name
                type
                description
                required
                default_value
            }
        }
    }
`;
