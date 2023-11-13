// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IAppModule} from '_types/shared';

export type IEventsManagerApp = IAppModule;

interface IDeps {
    'core.domain.eventsManager'?: IEventsManagerDomain;
}

export default function ({'core.domain.eventsManager': eventsManagerDomain = null}: IDeps = {}): IEventsManagerApp {
    return {
        extensionPoints: {
            registerEventActions(actions: string[]) {
                eventsManagerDomain.registerEventActions(actions);
            }
        }
    };
}
