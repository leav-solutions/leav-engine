// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILogsCollectorDomain} from 'domain/logsCollector/logsCollectorDomain';

export interface ILogsCollectorApp {
    init(): Promise<void>;
}

interface IDeps {
    'core.domain.logsCollector': ILogsCollectorDomain;
}

export default function ({'core.domain.logsCollector': logsCollector}: IDeps): ILogsCollectorApp {
    return {
        init: logsCollector.init
    };
}
