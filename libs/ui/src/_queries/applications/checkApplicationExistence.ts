import {gql} from '@apollo/client';

export const checkApplicationExistenceQuery = gql`
    query CHECK_APPLICATION_EXISTENCE($id: ID, $endpoint: String) {
        applications(filters: {id: $id, endpoint: $endpoint}) {
            totalCount
        }
    }
`;
