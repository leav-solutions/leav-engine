// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const saveUserData = gql`
    mutation SAVE_USER_DATA($key: String!, $value: Any, $global: Boolean!) {
        saveUserData(key: $key, value: $value, global: $global) {
            global
            data
        }
    }
`;
