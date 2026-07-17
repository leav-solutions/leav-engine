import {type NotificationTrackingEvent} from '../../__generated__';
import {DIM_PANEL_NAME, matomoEvents} from './constants/matomoEvents';
import {resolveActionDimensions} from './resolveActionDimensions';
import {type Panel} from '_ui/hooks/usePanelMessenger/types';

declare global {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Window {
        _paq?: unknown[][];
    }
}

let isTrackingEnabled = false;

const push = (args: unknown[]) => {
    if (!isTrackingEnabled) {
        return;
    }
    window._paq = window._paq || [];
    window._paq.push(args);
};

export const matomo = {
    setTrackingEnabled(enabled: boolean) {
        isTrackingEnabled = enabled;
    },
    setUserRole(userRole: string) {
        // ID 1 → User Role, scope Visit
        push(['setCustomDimension', 1, userRole || 'unknown']);
    },
    trackEvent(params: {
        category: string;
        action: string;
        name?: string;
        value?: number;
        customDimensions?: Record<number, string>;
    }) {
        if (params.customDimensions) {
            for (const [id, value] of Object.entries(params.customDimensions)) {
                push(['setCustomDimension', Number(id), value]);
            }
        }
        push(['trackEvent', params.category, params.action, params.name, params.value]);
        // Action-scope dimensions are sticky on the Matomo tracker: once set, `setCustomDimension`
        // keeps sending them on EVERY later hit until deleted or the page reloads. Delete them right
        // after this hit so they scope to this single event and don't leak onto later events
        if (params.customDimensions) {
            for (const id of Object.keys(params.customDimensions)) {
                push(['deleteCustomDimension', Number(id)]);
            }
        }
    },

    trackNavigationEvent(action: string, name: string) {
        if (!action || !name) {
            return;
        }
        this.trackEvent({category: matomoEvents.categories.navigation, action, name});
    },

    trackInteractionEvent(action: string, panel: Panel, lang: string[]) {
        if (!action) {
            return;
        }
        const customDimensions = resolveActionDimensions(panel, lang);
        this.trackEvent({
            category: matomoEvents.categories.interaction,
            action,
            name: customDimensions[DIM_PANEL_NAME],
            customDimensions,
        });
    },
};

export const trackNotificationEvents = (events: NotificationTrackingEvent[]) => {
    events.forEach(event =>
        matomo.trackEvent({
            category: event.category,
            action: event.action,
            name: event.name ?? undefined,
            value: event.value ?? undefined,
        }),
    );
};
