import {gql} from '@apollo/client';

export const deleteVersionProfileMutation = gql`
    mutation DELETE_VERSION_PROFILE($id: String!) {
        deleteVersionProfile(id: $id) {
            id
        }
    }
`;
