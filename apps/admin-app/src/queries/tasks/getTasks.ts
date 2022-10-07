// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const getTasks = gql`
    ${recordIdentityFragment}
    query GET_TASKS($filters: TaskFiltersInput) {
        tasks(filters: $filters) {
            totalCount
            list {
                id
                name
                modified_at
                created_at
                created_by {
                    ...RecordIdentity
                }
                startAt
                status
                priority
                progress {
                    percent
                    description
                }
                startedAt
                completedAt
                link {
                    name
                    url
                }
                canceledBy
            }
        }
    }
`;
