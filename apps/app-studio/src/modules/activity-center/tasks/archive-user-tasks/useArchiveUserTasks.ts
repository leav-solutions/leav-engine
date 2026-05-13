import {useArchiveUserTasksMutation} from '../../../../__generated__';
import {type Task} from '../types';

export const useArchiveUserTasks = () => {
    const [archiveUserTasksMutation] = useArchiveUserTasksMutation();

    const archiveUserTasks = async (tasks: Task[]) => {
        await archiveUserTasksMutation({variables: {tasks: tasks.map(task => ({id: task.id, archive: true}))}});
    };

    return {archiveUserTasks};
};
