// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITasksManagerApp} from 'app/core/tasksManagerApp';
import {AwilixContainer} from 'awilix';

export interface ITasksManagerInterface {
    init(): Promise<void>;
}

interface IDeps {
    'core.app.core.tasksManager'?: ITasksManagerApp;
}

export default function ({'core.app.core.tasksManager': tasksManager}: IDeps): ITasksManagerInterface {
    return {
        init: tasksManager.init
    };
}
