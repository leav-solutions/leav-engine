// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {type IQueryInfos} from '_types/queryInfos';
import {FakePluginActions} from '..';
import {type IEventsManagerDomain} from '../../../../../../domain/eventsManager/eventsManagerDomain';

export interface IFakeDomain {
    execWorker({fromTask}: {fromTask: string}): void;
    startPlugin(): void;
    getPluginStarted(): boolean;
}

interface IDeps {
    'core.domain.eventsManager': IEventsManagerDomain;
}

export default function ({'core.domain.eventsManager': eventsManagerDomain}: IDeps): IFakeDomain {
    let pluginStarted: boolean = false;

    return {
        async execWorker({fromTask, ctx}: {fromTask: string; ctx: IQueryInfos}): Promise<void> {
            // for check type, no test assertion yet
            await eventsManagerDomain.sendDatabaseEvent(
                {
                    action: FakePluginActions.FAKE_PLUGIN_ACTION,
                    topic: null,
                    metadata: {
                        fromTask,
                    },
                },
                ctx,
            );
        },
        startPlugin(): void {
            pluginStarted = true;
        },
        getPluginStarted(): boolean {
            return pluginStarted;
        },
    };
}
