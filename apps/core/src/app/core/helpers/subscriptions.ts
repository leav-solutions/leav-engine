// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PublishedEvent} from '_types/event';
import {IQueryInfos} from '_types/queryInfos';

export interface ICommonSubscriptionFilters {
    ignoreOwnEvents?: boolean;
}

export interface ICoreSubscriptionsHelpersApp {
    commonSubscriptionsFilters: string;
    isOwnEvent: (event: PublishedEvent<unknown>, ctx: IQueryInfos) => boolean;
}

export default function (): ICoreSubscriptionsHelpersApp {
    const commonSubscriptionsFilters = `
        ignoreOwnEvents: Boolean
    `;

    return {
        commonSubscriptionsFilters,
        isOwnEvent: (event, ctx) => {
            return event.userId === ctx.userId;
        }
    };
}
