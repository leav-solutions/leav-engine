import {type GET_TASKS_tasks_list} from '../../_gqlTypes/GET_TASKS';
import {TaskStatus} from '../../_gqlTypes';

export const mockTask: GET_TASKS_tasks_list = {
    id: 'taskId',
    archive: false,
    label: {fr: 'taskName', en: 'taskName'},
    modified_at: Date.now(),
    created_at: Date.now(),
    startAt: Date.now(),
    progress: {description: null, percent: 0},
    status: TaskStatus.PENDING,
    role: null,
    priority: 1,
    created_by: null,
    startedAt: null,
    completedAt: null,
    link: null,
    canceledBy: null,
};
