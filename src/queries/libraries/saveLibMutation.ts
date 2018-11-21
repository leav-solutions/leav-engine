import gql from 'graphql-tag';
import {Mutation} from 'react-apollo';
import {SAVE_LIBRARY, SAVE_LIBRARYVariables} from 'src/_gqlTypes/SAVE_LIBRARY';

export class SaveLibMutation extends Mutation<SAVE_LIBRARY, SAVE_LIBRARYVariables> {}

export const saveLibQuery = gql`
    mutation SAVE_LIBRARY($libData: LibraryInput!) {
        saveLibrary(library: $libData) {
            id
            system
            label
        }
    }
`;
