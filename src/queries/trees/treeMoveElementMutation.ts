import gql from 'graphql-tag';

export const moveTreeElementQuery = gql`
    mutation MOVE_TREE_ELEMENT($treeId: ID!, $element: TreeElementInput!, $parentTo: TreeElementInput, $order: Int) {
        treeMoveElement(treeId: $treeId, element: $element, parentTo: $parentTo, order: $order) {
            id
            library
        }
    }
`;
