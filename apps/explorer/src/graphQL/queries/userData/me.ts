// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const getMe = gql`
    query ME {
        me {
            id
            login
            whoAmI {
                id
                label
                color
                library {
                    id
                    label
                    gqlNames {
                        query
                        type
                    }
                }
                preview {
                    small
                    medium
                    big
                    pages
                }
            }
        }
    }
`;
