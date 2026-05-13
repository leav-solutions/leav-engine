import {gql} from '@apollo/client';

export const getAvailableActionsQuery = gql`
    query GET_AVAILABLE_ACTIONS {
        availableActions {
            id
            name
            description
            input_types
            output_types
            params {
                name
                type
                description
                required
                helper_value
            }
        }
    }
`;
