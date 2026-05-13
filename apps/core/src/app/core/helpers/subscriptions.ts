import {type PublishedEvent} from '@leav/utils';
import {type IQueryInfos} from '../../../_types/queryInfos';

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
        isOwnEvent: (event, ctx) => event.userId === ctx.userId,
    };
}
