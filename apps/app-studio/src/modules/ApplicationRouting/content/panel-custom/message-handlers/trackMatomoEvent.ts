import {matomo} from '../../../../../services/matomo';

interface IMatomoTrackPayload {
    type: 'matomo-track';
    eventCategory: string;
    eventAction: string;
    eventName?: string;
    eventValue?: number;
    customDimensions?: Record<number, string>;
}

const isMatomoTrackPayload = (data: unknown): data is IMatomoTrackPayload =>
    typeof data === 'object' && data !== null && (data as IMatomoTrackPayload).type === 'matomo-track';

export const trackMatomoEvent = (data: unknown) => {
    if (isMatomoTrackPayload(data)) {
        matomo.trackEvent({
            category: data.eventCategory,
            action: data.eventAction,
            name: data.eventName,
            value: data.eventValue,
            customDimensions: data?.customDimensions,
        });
    }
};
