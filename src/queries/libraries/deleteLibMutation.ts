// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Mutation} from '@apollo/react-components';
import gql from 'graphql-tag';
import {DELETE_LIBRARY, DELETE_LIBRARYVariables} from '../../_gqlTypes/DELETE_LIBRARY';

export const DeleteLibMutation = p => Mutation<DELETE_LIBRARY, DELETE_LIBRARYVariables>(p);

export const deleteLibQuery = gql`
    mutation DELETE_LIBRARY($libID: ID!) {
        deleteLibrary(id: $libID) {
            id
        }
    }
`;
