// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import {treeDetailsFragment} from './treeDetailsFragment';

export const saveTreeMutation = gql`
    ${treeDetailsFragment}
    mutation SAVE_TREE($tree: TreeInput!) {
        saveTree(tree: $tree) {
            ...TreeDetails
        }
    }
`;
