import {gql} from '@apollo/client';
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
