// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {libraryDetailsFragment} from './libraryDetailsFragment';

export const getLibByIdQuery = gql`
    ${libraryDetailsFragment}
    query GET_LIB_BY_ID($id: [ID!], $lang: [AvailableLanguage!]) {
        libraries(filters: {id: $id}) {
            list {
                ...LibraryDetails
            }
        }
    }
`;
