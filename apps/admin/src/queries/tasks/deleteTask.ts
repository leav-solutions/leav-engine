// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';

export const deleteTaskMutation = gql`
    mutation DELETE_TASK($taskId: ID!, $archive: Boolean!) {
        deleteTask(taskId: $taskId, archive: $archive)
    }
`;
