import {Mutation} from '@apollo/react-components';
import gql from 'graphql-tag';
import {DELETE_LIBRARY, DELETE_LIBRARYVariables} from '../../_gqlTypes/DELETE_LIBRARY';

/* tslint:disable-next-line:variable-name */
export const DeleteLibMutation = p => Mutation<DELETE_LIBRARY, DELETE_LIBRARYVariables>(p);

export const deleteLibQuery = gql`
    mutation DELETE_LIBRARY($libID: ID!) {
        deleteLibrary(id: $libID) {
            id
        }
    }
`;
