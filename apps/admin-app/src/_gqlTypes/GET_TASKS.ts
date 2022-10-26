// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TaskFiltersInput, TaskStatus} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_TASKS
// ====================================================

export interface GET_TASKS_tasks_list_created_by_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_TASKS_tasks_list_created_by_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface GET_TASKS_tasks_list_created_by_whoAmI {
    id: string;
    library: GET_TASKS_tasks_list_created_by_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: GET_TASKS_tasks_list_created_by_whoAmI_preview | null;
}

export interface GET_TASKS_tasks_list_created_by {
    whoAmI: GET_TASKS_tasks_list_created_by_whoAmI;
}

export interface GET_TASKS_tasks_list_progress {
    percent: number | null;
    description: string | null;
}

export interface GET_TASKS_tasks_list_link {
    name: string;
    url: string;
}

export interface GET_TASKS_tasks_list_canceledBy_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_TASKS_tasks_list_canceledBy_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface GET_TASKS_tasks_list_canceledBy_whoAmI {
    id: string;
    library: GET_TASKS_tasks_list_canceledBy_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: GET_TASKS_tasks_list_canceledBy_whoAmI_preview | null;
}

export interface GET_TASKS_tasks_list_canceledBy {
    whoAmI: GET_TASKS_tasks_list_canceledBy_whoAmI;
}

export interface GET_TASKS_tasks_list {
    id: string;
    label: SystemTranslation;
    modified_at: number;
    created_at: number;
    created_by: GET_TASKS_tasks_list_created_by;
    startAt: number;
    status: TaskStatus;
    priority: TaskPriority;
    progress: GET_TASKS_tasks_list_progress | null;
    startedAt: number | null;
    completedAt: number | null;
    link: GET_TASKS_tasks_list_link | null;
    canceledBy: GET_TASKS_tasks_list_canceledBy | null;
    archive: boolean;
}

export interface GET_TASKS_tasks {
    totalCount: number;
    list: GET_TASKS_tasks_list[];
}

export interface GET_TASKS {
    tasks: GET_TASKS_tasks;
}

export interface GET_TASKSVariables {
    filters?: TaskFiltersInput | null;
}
