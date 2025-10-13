// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ILogsCollectorApp} from 'app/core/logsCollectorApp';

export interface ILogsCollectorInterface {
    init(): Promise<void>;
}

interface IDeps {
    'core.app.core.logsCollector': ILogsCollectorApp;
}

export default function ({'core.app.core.logsCollector': logsCollector}: IDeps): ILogsCollectorInterface {
    return {
        init: logsCollector.init
    };
}
