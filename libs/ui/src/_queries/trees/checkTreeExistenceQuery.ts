// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const checkTreeExistenceQuery = gql`
    query CHECK_TREE_EXISTENCE($id: [ID!]) {
        trees(filters: {id: $id}) {
            totalCount
        }
    }
`;
