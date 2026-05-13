import {gql} from '@apollo/client';
import {libraryDetailsFragment} from './libraryDetailsFragment';

export const saveLibQuery = gql`
    ${libraryDetailsFragment}
    mutation SAVE_LIBRARY($libData: LibraryInput!, $lang: [AvailableLanguage!]) {
        saveLibrary(library: $libData) {
            ...LibraryDetails
        }
    }
`;
