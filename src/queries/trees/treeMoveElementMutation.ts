import gql from 'graphql-tag';

export const moveTreeElementQuery = gql`
    mutation MOVE_TREE_ELEMENT($treeId: ID!, $element: TreeElementInput!, $parentTo: TreeElementInput) {
        treeMoveElement(treeId: $treeId, element: $element, parentTo: $parentTo) {
            id
            library
        }
    }
`;
