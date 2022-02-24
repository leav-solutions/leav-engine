// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const deleteTreeElementQuery = gql`
    mutation DELETE_TREE_ELEMENT($treeId: ID!, $nodeId: ID!, $deleteChildren: Boolean) {
        treeDeleteElement(treeId: $treeId, nodeId: $nodeId, deleteChildren: $deleteChildren) {
            id
        }
    }
`;
