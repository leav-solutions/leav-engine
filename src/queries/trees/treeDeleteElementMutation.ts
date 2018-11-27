import gql from 'graphql-tag';

export const deleteTreeElementQuery = gql`
    mutation DELETE_TREE_ELEMENT($treeId: ID!, $element: TreeElementInput!, $deleteChildren: Boolean) {
        treeDeleteElement(treeId: $treeId, element: $element, deleteChildren: $deleteChildren) {
            id
            library
        }
    }
`;
