// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {libraryDetailsFragment} from './libraryDetailsFragment';

export const saveLibQuery = gql`
    ${libraryDetailsFragment}
    mutation SAVE_LIBRARY($libData: LibraryInput!, $lang: [AvailableLanguage!]) {
        saveLibrary(library: $libData) {
            ...LibraryDetails
        }
    }
`;
