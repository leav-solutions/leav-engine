import {gql} from '@apollo/client';

export const getCoreVersionQuery = gql`
    query GET_VERSION {
        version
    }
`;
