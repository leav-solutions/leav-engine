// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {GET_TASKS_tasks_list} from '_gqlTypes/GET_TASKS';
import {TaskStatus, TaskType} from '_gqlTypes/globalTypes';

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
    canceledBy: null
};
