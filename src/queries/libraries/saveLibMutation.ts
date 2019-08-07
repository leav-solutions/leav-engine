import {Mutation} from '@apollo/react-components';
import gql from 'graphql-tag';
import {SAVE_LIBRARY, SAVE_LIBRARYVariables} from '../../_gqlTypes/SAVE_LIBRARY';

/* tslint:disable-next-line:variable-name */
export const SaveLibMutation = p => Mutation<SAVE_LIBRARY, SAVE_LIBRARYVariables>(p);

export const saveLibQuery = gql`
    mutation SAVE_LIBRARY($libData: LibraryInput!) {
        saveLibrary(library: $libData) {
            id
            system
            label
        }
    }
`;
