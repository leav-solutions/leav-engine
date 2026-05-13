import {gql} from '@apollo/client';

export const deleteTreeQuery = gql`
    mutation DELETE_TREE($treeId: ID!) {
        deleteTree(id: $treeId) {
            id
        }
    }
`;
