import {gql} from '@apollo/client';

export const checkTreeExistenceQuery = gql`
    query CHECK_TREE_EXISTENCE($id: [ID!]) {
        trees(filters: {id: $id}) {
            totalCount
        }
    }
`;
