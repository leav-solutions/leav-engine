import {gql} from '@apollo/client';

export const moveTreeElementMutation = gql`
    mutation MOVE_TREE_ELEMENT($treeId: ID!, $nodeId: ID!, $parentTo: ID, $order: Int) {
        treeMoveElement(treeId: $treeId, nodeId: $nodeId, parentTo: $parentTo, order: $order) {
            id
        }
    }
`;
