import {gql} from '@apollo/client';

export const checkLibraryExistenceQuery = gql`
    query CHECK_LIBRARY_EXISTENCE($id: [ID!]) {
        libraries(filters: {id: $id}) {
            totalCount
        }
    }
`;
