import gql from 'graphql-tag';

export const addTreeElementQuery = gql`
    mutation ADD_TREE_ELEMENT($treeId: ID!, $element: TreeElementInput!, $parent: TreeElementInput) {
        treeAddElement(treeId: $treeId, element: $element, parent: $parent, order: 0) {
            id
            library
        }
    }
`;
