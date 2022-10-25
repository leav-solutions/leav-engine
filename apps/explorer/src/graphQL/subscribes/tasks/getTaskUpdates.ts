// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';
import recordIdentityFragment from '../../queries/records/recordIdentityFragment';

export const getTaskUpdates = gql`
    ${recordIdentityFragment}
    subscription SUB_TASKS_UPDATE($filters: TaskFiltersInput) {
        task(filters: $filters) {
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
            canceledBy {
                ...RecordIdentity
            }
            archive
        }
    }
`;
