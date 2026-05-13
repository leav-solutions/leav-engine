import {gql} from '@apollo/client';

export const saveUserData = gql`
    mutation SAVE_USER_DATA($key: String!, $value: Any, $global: Boolean!) {
        saveUserData(key: $key, value: $value, global: $global) {
            global
            data
        }
    }
`;
