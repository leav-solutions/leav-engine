import {type ILogsCollectorDomain} from '../../domain/logsCollector/logsCollectorDomain';

export interface ILogsCollectorApp {
    init(): Promise<void>;
}

interface IDeps {
    'core.domain.logsCollector': ILogsCollectorDomain;
}

export default function ({'core.domain.logsCollector': logsCollector}: IDeps): ILogsCollectorApp {
    return {
        init: logsCollector.init,
    };
}
