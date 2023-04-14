// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const checkLibraryExistenceQuery = gql`
    query CHECK_LIBRARY_EXISTENCE($id: [ID!]) {
        libraries(filters: {id: $id}) {
            totalCount
        }
    }
`;
