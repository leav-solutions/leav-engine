import {gql} from '@apollo/client';

export const deleteTreeElementQuery = gql`
    mutation DELETE_TREE_ELEMENT($treeId: ID!, $nodeId: ID!, $deleteChildren: Boolean) {
        treeDeleteElement(treeId: $treeId, nodeId: $nodeId, deleteChildren: $deleteChildren)
    }
`;
