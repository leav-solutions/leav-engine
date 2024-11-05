// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TaskFiltersInput, TaskStatus} from './globalTypes';

// ====================================================
// GraphQL subscription operation: SUB_TASKS_UPDATE
// ====================================================

export interface SUB_TASKS_UPDATE_task_created_by_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SUB_TASKS_UPDATE_task_created_by_whoAmI {
    id: string;
    library: SUB_TASKS_UPDATE_task_created_by_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface SUB_TASKS_UPDATE_task_created_by {
    whoAmI: SUB_TASKS_UPDATE_task_created_by_whoAmI;
}

export interface SUB_TASKS_UPDATE_task_progress {
    percent: number | null;
    description: SystemTranslation | null;
}

export interface SUB_TASKS_UPDATE_task_link {
    name: string;
    url: string;
}

export interface SUB_TASKS_UPDATE_task_canceledBy_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SUB_TASKS_UPDATE_task_canceledBy_whoAmI {
    id: string;
    library: SUB_TASKS_UPDATE_task_canceledBy_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface SUB_TASKS_UPDATE_task_canceledBy {
    whoAmI: SUB_TASKS_UPDATE_task_canceledBy_whoAmI;
}

export interface SUB_TASKS_UPDATE_task {
    id: string;
    label: SystemTranslation;
    modified_at: number;
    created_at: number;
    created_by: SUB_TASKS_UPDATE_task_created_by;
    startAt: number;
    status: TaskStatus;
    priority: TaskPriority;
    progress: SUB_TASKS_UPDATE_task_progress | null;
    startedAt: number | null;
    completedAt: number | null;
    link: SUB_TASKS_UPDATE_task_link | null;
    canceledBy: SUB_TASKS_UPDATE_task_canceledBy | null;
    archive: boolean;
}

export interface SUB_TASKS_UPDATE {
    task: SUB_TASKS_UPDATE_task;
}

export interface SUB_TASKS_UPDATEVariables {
    filters?: TaskFiltersInput | null;
}
