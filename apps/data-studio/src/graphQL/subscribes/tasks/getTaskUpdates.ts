// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
