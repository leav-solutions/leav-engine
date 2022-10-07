// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TaskStatus} from './globalTypes';

// ====================================================
// GraphQL subscription operation: SUB_TASKS_UPDATE
// ====================================================

export interface SUB_TASKS_UPDATE_task_progress {
    percent: number;
    description: string | null;
}

export interface SUB_TASKS_UPDATE_task_link {
    name: string;
    url: string;
}

export interface SUB_TASKS_UPDATE_task {
    id: string;
    name: string;
    modified_at: number | null;
    created_at: number | null;
    startAt: number | null;
    status: TaskStatus | null;
    priority: any | null;
    progress: SUB_TASKS_UPDATE_task_progress | null;
    startedAt: number | null;
    completedAt: number | null;
    link: SUB_TASKS_UPDATE_task_link | null;
    canceledBy: string | null;
}

export interface SUB_TASKS_UPDATE {
    task: SUB_TASKS_UPDATE_task;
}
