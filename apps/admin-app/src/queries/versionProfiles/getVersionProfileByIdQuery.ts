// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const getVersionProfileByIdQuery = gql`
    query GET_VERSION_PROFILE_BY_ID($id: ID!) {
        versionProfiles(filters: {id: $id}) {
            list {
                id
                label
                description
                trees {
                    id
                    label
                }
                linkedAttributes {
                    id
                    label
                }
            }
        }
    }
`;
