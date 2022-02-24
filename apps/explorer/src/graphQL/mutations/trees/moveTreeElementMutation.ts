// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const moveTreeElementMutation = gql`
    mutation MOVE_TREE_ELEMENT($treeId: ID!, $nodeId: ID!, $parentTo: ID, $order: Int) {
        treeMoveElement(treeId: $treeId, nodeId: $nodeId, parentTo: $parentTo, order: $order) {
            id
        }
    }
`;
