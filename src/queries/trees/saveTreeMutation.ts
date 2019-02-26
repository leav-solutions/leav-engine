import gql from 'graphql-tag';
import {Mutation} from 'react-apollo';
import {SAVE_TREE, SAVE_TREEVariables} from '../../_gqlTypes/SAVE_TREE';

export class SaveTreeMutation extends Mutation<SAVE_TREE, SAVE_TREEVariables> {}

export const saveTreeQuery = gql`
    mutation SAVE_TREE($treeData: TreeInput!) {
        saveTree(tree: $treeData) {
            id
            system
            label
            libraries
        }
    }
`;
