import gql from 'graphql-tag';
import {Mutation} from 'react-apollo';
import {DELETE_LIBRARY, DELETE_LIBRARYVariables} from '../_gqlTypes/DELETE_LIBRARY';

export class DeleteLibMutation extends Mutation<DELETE_LIBRARY, DELETE_LIBRARYVariables> {}

export const deleteLibQuery = gql`
    mutation DELETE_LIBRARY($libID: ID!) {
        deleteLibrary(id: $libID) {
            id
        }
    }
`;
