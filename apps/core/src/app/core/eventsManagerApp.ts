// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {IAppModule} from '_types/shared';

export type IEventsManagerApp = IAppModule;

interface IDeps {
    'core.domain.eventsManager'?: IEventsManagerDomain;
    config?: IConfig;
}

export default function ({
    'core.domain.eventsManager': eventsManagerDomain = null,
    config = null
}: IDeps = {}): IEventsManagerApp {
    return {
        extensionPoints: {
            registerEventActions(actions: string[], prefix: string) {
                const ctx: IQueryInfos = {
                    userId: config.defaultUserId,
                    lang: config.lang.default
                };

                eventsManagerDomain.registerEventActions(actions, prefix, ctx);
            }
        }
    };
}
