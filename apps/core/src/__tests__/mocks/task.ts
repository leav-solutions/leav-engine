// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ITask,
    ITaskCallback,
    ITaskFunc,
    TaskCallbackStatus,
    TaskCallbackType,
    TaskPriority,
    TaskStatus
} from '../../_types/tasksManager';

const mockFunc: ITaskFunc = {
    moduleName: 'moduleName',
    subModuleName: 'subModuleName',
    name: 'name',
    args: {arg1: 'arg1'}
};

const mockCallback: ITaskCallback = {
    moduleName: 'moduleName',
    subModuleName: 'subModuleName',
    name: 'name',
    args: [],
    status: TaskCallbackStatus.PENDING,
    type: [TaskCallbackType.ON_CANCEL, TaskCallbackType.ON_FAILURE, TaskCallbackType.ON_SUCCESS]
};

export const mockTask: ITask = {
    id: 'mockTaskId',
    label: {fr: 'mockTask', en: 'mockTask'},
    created_at: 1234567890,
    created_by: '1',
    modified_at: 1234567890,
    func: mockFunc,
    startAt: 1234567890,
    status: TaskStatus.CREATED,
    priority: TaskPriority.MEDIUM,
    archive: false,
    callback: mockCallback
};
