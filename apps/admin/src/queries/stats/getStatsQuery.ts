import {gql} from '@apollo/client';

export const getStatsQuery = gql`
    query GET_STATS {
        libraries(pagination: {offset: 0, limit: 1}) {
            totalCount
        }
        attributes(pagination: {offset: 0, limit: 1}) {
            totalCount
        }
        trees(pagination: {offset: 0, limit: 1}) {
            totalCount
        }
        applications(pagination: {offset: 0, limit: 1}) {
            totalCount
        }
    }
`;
