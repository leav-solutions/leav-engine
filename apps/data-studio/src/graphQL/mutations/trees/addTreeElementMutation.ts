import {gql} from '@apollo/client';

export const addTreeElementMutation = gql`
    mutation ADD_TREE_ELEMENT($treeId: ID!, $element: TreeElementInput!, $parent: ID, $order: Int) {
        treeAddElement(treeId: $treeId, element: $element, parent: $parent, order: $order) {
            id
        }
    }
`;
