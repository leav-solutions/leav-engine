import {gql} from '@apollo/client';
import {recordIdentityFragment} from '../records/recordIdentityFragment';

export const getTasks = gql`
    ${recordIdentityFragment}
    query GET_TASKS($filters: TaskFiltersInput) {
        tasks(filters: $filters) {
            totalCount
            list {
                id
                label
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
                canceledBy {
                    ...RecordIdentity
                }
                archive
            }
        }
    }
`;
