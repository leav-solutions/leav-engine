// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const addTreeElementQuery = gql`
    mutation ADD_TREE_ELEMENT($treeId: ID!, $element: TreeElementInput!, $parent: TreeElementInput) {
        treeAddElement(treeId: $treeId, element: $element, parent: $parent, order: 0) {
            id
            library
        }
    }
`;
