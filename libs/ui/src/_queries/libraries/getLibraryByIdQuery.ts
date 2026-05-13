import {gql} from '@apollo/client';
import {libraryDetailsFragment} from './libraryDetailsFragment';

export const getLibraryByIdQuery = gql`
    ${libraryDetailsFragment}
    query GET_LIBRARY_BY_ID($id: [ID!]) {
        libraries(filters: {id: $id}) {
            list {
                ...LibraryDetails
            }
        }
    }
`;
