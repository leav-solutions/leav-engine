import {gql} from '@apollo/client';

export const cancelTaskMutation = gql`
    mutation CANCEL_TASK($taskId: ID!) {
        cancelTask(taskId: $taskId)
    }
`;
