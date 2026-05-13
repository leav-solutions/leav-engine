import {gql} from '@apollo/client';

export const deleteTreeMutation = gql`
    mutation DELETE_TREE($id: ID!) {
        deleteTree(id: $id) {
            id
        }
    }
`;
