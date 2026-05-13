import {gql} from '@apollo/client';

export const checkAttributeExistenceQuery = gql`
    query CHECK_ATTRIBUTE_EXISTENCE($id: ID!) {
        attributes(filters: {id: $id}) {
            totalCount
        }
    }
`;
