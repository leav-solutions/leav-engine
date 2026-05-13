import {gql} from '@apollo/client';

export const deleteAttributeMutation = gql`
    mutation DELETE_ATTRIBUTE($id: ID) {
        deleteAttribute(id: $id) {
            id
        }
    }
`;
