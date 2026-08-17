import {type IConfig} from './_types/config';
import {type ICorePluginsApp} from './app/core/pluginsApp';
import {type IAutomationInterface} from './interface/automation';
import {type ICliInterface} from './interface/cli';
import {type IFilesManagerInterface} from './interface/filesManager';
import {type IIndexationManagerInterface} from './interface/indexationManager';
import {type ILogsCollectorInterface} from './interface/logsCollector';
import {type ISDOInterface} from './interface/sdo';
import {type IServer} from './interface/server';
import {type ITasksManagerInterface} from './interface/tasksManager';
import {type IUtils} from './utils/utils';

export interface ICoreDepsList {
    config: IConfig;
    'core.interface.server': IServer;
    'core.interface.filesManager': IFilesManagerInterface;
    'core.interface.indexationManager': IIndexationManagerInterface;
    'core.interface.logsCollector': ILogsCollectorInterface;
    'core.interface.tasksManager': ITasksManagerInterface;
    'core.interface.automation': IAutomationInterface;
    'core.interface.sdo': ISDOInterface;
    'core.interface.cli': ICliInterface;
    'core.utils': IUtils;
    'core.app.core.plugins': ICorePluginsApp;

    // TODO add all others
}
