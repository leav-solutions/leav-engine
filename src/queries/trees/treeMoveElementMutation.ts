// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const moveTreeElementQuery = gql`
    mutation MOVE_TREE_ELEMENT($treeId: ID!, $element: TreeElementInput!, $parentTo: TreeElementInput, $order: Int) {
        treeMoveElement(treeId: $treeId, element: $element, parentTo: $parentTo, order: $order) {
            id
            library
        }
    }
`;
