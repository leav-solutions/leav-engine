// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getUserDataQuery = gql`
    query GET_USER_DATA($keys: [String!]!, $global: Boolean) {
        userData(keys: $keys, global: $global) {
            global
            data
        }
    }
`;
