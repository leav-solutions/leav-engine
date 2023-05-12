// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

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
                default_value
            }
        }
    }
`;
