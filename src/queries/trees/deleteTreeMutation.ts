import {Mutation} from '@apollo/react-components';
import gql from 'graphql-tag';
import {DELETE_TREE, DELETE_TREEVariables} from '../../_gqlTypes/DELETE_TREE';

export const deleteTreeQuery = gql`
    mutation DELETE_TREE($treeId: ID!) {
        deleteTree(id: $treeId) {
            id
        }
    }
`;

/* tslint:disable-next-line:variable-name */
export const DeleteTreeMutation = p => Mutation<DELETE_TREE, DELETE_TREEVariables>(p);
