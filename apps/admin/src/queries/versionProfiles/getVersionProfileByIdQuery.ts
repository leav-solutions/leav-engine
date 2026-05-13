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
