import {gql} from '@apollo/client';

export const deleteApplicationQuery = gql`
    mutation DELETE_APPLICATION($appId: ID!) {
        deleteApplication(id: $appId) {
            id
        }
    }
`;
