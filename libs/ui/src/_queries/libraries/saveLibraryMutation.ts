import {gql} from '@apollo/client';
import {libraryDetailsFragment} from './libraryDetailsFragment';

export const saveLibraryMutation = gql`
    ${libraryDetailsFragment}
    mutation saveLibrary($library: LibraryInput!) {
        saveLibrary(library: $library) {
            ...LibraryDetails
        }
    }
`;
