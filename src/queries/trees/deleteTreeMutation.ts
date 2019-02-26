import gql from 'graphql-tag';
import {Mutation} from 'react-apollo';
import {DELETE_TREE, DELETE_TREEVariables} from '../../_gqlTypes/DELETE_TREE';

export const deleteTreeQuery = gql`
    mutation DELETE_TREE($treeId: ID!) {
        deleteTree(id: $treeId) {
            id
        }
    }
`;

export class DeleteTreeMutation extends Mutation<DELETE_TREE, DELETE_TREEVariables> {}
