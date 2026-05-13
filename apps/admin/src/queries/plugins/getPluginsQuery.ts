import {gql} from '@apollo/client';

export const getPluginsQuery = gql`
    query GET_ALL_PLUGINS {
        plugins {
            name
            description
            version
            author
        }
    }
`;
