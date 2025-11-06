// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type InitQueryContextFunc} from 'app/helpers/initQueryContext';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type IConfig} from '_types/config';
import {type IQueryInfos} from '_types/queryInfos';
import {type IAppModule} from '_types/shared';

export type IEventsManagerApp = IAppModule;

interface IDeps {
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.app.helpers.initQueryContext': InitQueryContextFunc;
    config: IConfig;
}

export default function ({
    'core.app.helpers.initQueryContext': initQueryContext,
    'core.domain.eventsManager': eventsManagerDomain,
    config,
}: IDeps): IEventsManagerApp {
    return {
        extensionPoints: {
            registerEventActions(actions: string[], prefix: string) {
                const ctx: IQueryInfos = {
                    ...initQueryContext(),
                    userId: config.defaultUserId,
                    lang: config.lang.default,
                };

                eventsManagerDomain.registerEventActions(actions, prefix, ctx);
            },
        },
    };
}
