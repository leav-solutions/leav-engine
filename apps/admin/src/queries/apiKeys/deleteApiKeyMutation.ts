import {gql} from '@apollo/client';

export const deleteApiKeyMutation = gql`
    mutation DELETE_API_KEY($id: String!) {
        deleteApiKey(id: $id) {
            id
        }
    }
`;
