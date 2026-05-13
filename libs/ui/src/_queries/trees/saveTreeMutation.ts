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
