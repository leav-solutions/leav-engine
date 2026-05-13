import {gql} from '@apollo/client';
import recordIdentityFragment from '../../queries/records/recordIdentityFragment';

export const getTaskUpdates = gql`
    ${recordIdentityFragment}
    subscription SUB_TASKS_UPDATE($filters: TaskFiltersInput) {
        task(filters: $filters) {
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
            role {
                type
                detail
            }
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
`;
