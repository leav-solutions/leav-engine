import {Mutation} from '@apollo/react-components';
import gql from 'graphql-tag';
import {SAVE_TREE, SAVE_TREEVariables} from '../../_gqlTypes/SAVE_TREE';

export const SaveTreeMutation = p => Mutation<SAVE_TREE, SAVE_TREEVariables>(p);

export const saveTreeQuery = gql`
    mutation SAVE_TREE($treeData: TreeInput!) {
        saveTree(tree: $treeData) {
            id
            system
            label
            libraries {
                id
                label
            }
        }
    }
`;
