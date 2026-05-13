import {gql} from '@apollo/client';

export const removeTreeElementMutation = gql`
    mutation REMOVE_TREE_ELEMENT($treeId: ID!, $nodeId: ID!, $deleteChildren: Boolean) {
        treeDeleteElement(treeId: $treeId, nodeId: $nodeId, deleteChildren: $deleteChildren)
    }
`;
