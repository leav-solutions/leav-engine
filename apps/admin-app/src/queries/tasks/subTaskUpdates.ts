// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gql} from '@apollo/client';

export const subTaskUpdates = gql`
    subscription SUB_TASKS_UPDATE {
        task {
            id
            name
            modified_at
            created_at
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
`;
