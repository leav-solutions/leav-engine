// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
