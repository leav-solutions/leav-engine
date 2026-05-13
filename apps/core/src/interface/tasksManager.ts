import {type ITasksManagerApp} from '../app/core/tasksManagerApp';

export interface ITasksManagerInterface {
    initMaster(): Promise<NodeJS.Timeout>;
    initWorker(): Promise<void>;
}

interface IDeps {
    'core.app.core.tasksManager': ITasksManagerApp;
}

export default function ({'core.app.core.tasksManager': tasksManager}: IDeps): ITasksManagerInterface {
    return {
        initMaster: tasksManager.initMaster,
        initWorker: tasksManager.initWorker,
    };
}
