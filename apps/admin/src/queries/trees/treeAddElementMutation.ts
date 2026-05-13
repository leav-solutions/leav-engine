import {gql} from '@apollo/client';

export const addTreeElementQuery = gql`
    mutation ADD_TREE_ELEMENT($treeId: ID!, $element: TreeElementInput!, $parent: ID) {
        treeAddElement(treeId: $treeId, element: $element, parent: $parent, order: 0) {
            id
        }
    }
`;
