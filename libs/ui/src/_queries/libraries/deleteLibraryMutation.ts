import {gql} from '@apollo/client';

export const deleteLibraryMutation = gql`
    mutation DELETE_LIBRARY($id: ID) {
        deleteLibrary(id: $id) {
            id
        }
    }
`;
