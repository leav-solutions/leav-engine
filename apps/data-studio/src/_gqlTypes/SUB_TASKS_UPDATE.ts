// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TaskFiltersInput, FileType, TaskStatus} from './globalTypes';

// ====================================================
// GraphQL subscription operation: SUB_TASKS_UPDATE
// ====================================================

export interface SUB_TASKS_UPDATE_task_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_TASKS_UPDATE_task_created_by_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: SUB_TASKS_UPDATE_task_created_by_whoAmI_library_gqlNames;
}

export interface SUB_TASKS_UPDATE_task_created_by_whoAmI_preview_file_library {
    id: string;
}

export interface SUB_TASKS_UPDATE_task_created_by_whoAmI_preview_file {
    id: string;
    file_type: FileType;
    library: SUB_TASKS_UPDATE_task_created_by_whoAmI_preview_file_library;
}

export interface SUB_TASKS_UPDATE_task_created_by_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
    original: string;
    file: SUB_TASKS_UPDATE_task_created_by_whoAmI_preview_file | null;
}

export interface SUB_TASKS_UPDATE_task_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: SUB_TASKS_UPDATE_task_created_by_whoAmI_library;
    preview: SUB_TASKS_UPDATE_task_created_by_whoAmI_preview | null;
}

export interface SUB_TASKS_UPDATE_task_created_by {
    id: string;
    whoAmI: SUB_TASKS_UPDATE_task_created_by_whoAmI;
}

export interface SUB_TASKS_UPDATE_task_progress {
    percent: number | null;
    description: any | null;
}

export interface SUB_TASKS_UPDATE_task_link {
    name: string;
    url: string;
}

export interface SUB_TASKS_UPDATE_task_canceledBy_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_TASKS_UPDATE_task_canceledBy_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: SUB_TASKS_UPDATE_task_canceledBy_whoAmI_library_gqlNames;
}

export interface SUB_TASKS_UPDATE_task_canceledBy_whoAmI_preview_file_library {
    id: string;
}

export interface SUB_TASKS_UPDATE_task_canceledBy_whoAmI_preview_file {
    id: string;
    file_type: FileType;
    library: SUB_TASKS_UPDATE_task_canceledBy_whoAmI_preview_file_library;
}

export interface SUB_TASKS_UPDATE_task_canceledBy_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
    original: string;
    file: SUB_TASKS_UPDATE_task_canceledBy_whoAmI_preview_file | null;
}

export interface SUB_TASKS_UPDATE_task_canceledBy_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: SUB_TASKS_UPDATE_task_canceledBy_whoAmI_library;
    preview: SUB_TASKS_UPDATE_task_canceledBy_whoAmI_preview | null;
}

export interface SUB_TASKS_UPDATE_task_canceledBy {
    id: string;
    whoAmI: SUB_TASKS_UPDATE_task_canceledBy_whoAmI;
}

export interface SUB_TASKS_UPDATE_task {
    id: string;
    label: any;
    modified_at: number;
    created_at: number;
    created_by: SUB_TASKS_UPDATE_task_created_by;
    startAt: number;
    status: TaskStatus;
    priority: any;
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
