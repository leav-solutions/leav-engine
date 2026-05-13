import {type ILogsCollectorApp} from '../app/core/logsCollectorApp';

export interface ILogsCollectorInterface {
    init(): Promise<void>;
}

interface IDeps {
    'core.app.core.logsCollector': ILogsCollectorApp;
}

export default function ({'core.app.core.logsCollector': logsCollector}: IDeps): ILogsCollectorInterface {
    return {
        init: logsCollector.init,
    };
}
