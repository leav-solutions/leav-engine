// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getApplicationByIdQuery = gql`
    query GET_APPLICATION_BY_ID($id: ID!) {
        applications(filters: {id: $id}) {
            list {
                id
                label
                description
                endpoint
                url
                color
                icon
                module
                libraries {
                    id
                }
                trees {
                    id
                }
                permissions {
                    access_application
                    admin_application
                }
                install {
                    status
                    lastCallResult
                }
            }
        }
    }
`;
