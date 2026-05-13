import {gql} from '@apollo/client';

export const getUserDataQuery = gql`
    query GET_USER_DATA($keys: [String!]!, $global: Boolean) {
        userData(keys: $keys, global: $global) {
            global
            data
        }
    }
`;
