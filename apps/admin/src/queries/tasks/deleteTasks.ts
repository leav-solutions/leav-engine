import {gql} from '@apollo/client';

export const deleteTasksMutation = gql`
    mutation DELETE_TASKS($tasks: [DeleteTaskInput!]!) {
        deleteTasks(tasks: $tasks)
    }
`;
