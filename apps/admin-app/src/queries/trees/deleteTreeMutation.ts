// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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

export const DeleteTreeMutation = p => Mutation<DELETE_TREE, DELETE_TREEVariables>(p);
