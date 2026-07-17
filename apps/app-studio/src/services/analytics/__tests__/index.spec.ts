import {beforeEach, describe, expect, it} from 'vitest';
import {matomo} from '../index';
import {matomoEvents} from '../constants/matomoEvents';

const campaignPanel = {id: 'campaigns', type: 'explorer', name: {fr: 'Campagnes'}} as any;

describe('analytics matomo service', () => {
    beforeEach(() => {
        window._paq = [];
        // Default to disabled — mirrors a fresh generic instance before any config opts in.
        matomo.setTrackingEnabled(false);
    });

    it('should not push anything while tracking is disabled (generic instances)', () => {
        matomo.trackNavigationEvent('action', 'name');
        matomo.setUserRole('admin');
        matomo.trackEvent({category: 'category', action: 'action'});
        matomo.trackInteractionEvent(matomoEvents.actions.filter_applied, campaignPanel, ['fr']);

        expect(window._paq).toEqual([]);
    });

    it('should push events once tracking is enabled by config', () => {
        matomo.setTrackingEnabled(true);

        matomo.trackNavigationEvent('action', 'name');

        expect(window._paq).toContainEqual(['trackEvent', 'Navigation', 'action', 'name', undefined]);
    });

    it('should push all custom dimensions before the trackEvent entry (Action scope)', () => {
        matomo.setTrackingEnabled(true);

        matomo.trackInteractionEvent(matomoEvents.actions.filter_applied, campaignPanel, ['fr']);

        const trackIdx = window._paq!.findIndex(entry => entry[0] === 'trackEvent');
        const setDimEntries = window._paq!.filter(entry => entry[0] === 'setCustomDimension');

        expect(setDimEntries.length).toBe(3);
        window._paq!.forEach((entry, index) => {
            if (entry[0] === 'setCustomDimension') {
                expect(index).toBeLessThan(trackIdx);
            }
        });
        expect(window._paq).toContainEqual(['setCustomDimension', 2, 'Explorer']);
        expect(window._paq).toContainEqual(['setCustomDimension', 3, 'Campagnes']);
        expect(window._paq).toContainEqual(['setCustomDimension', 4, 'false']);
        expect(window._paq).toContainEqual(['trackEvent', 'Interaction', 'Filtre Appliqué', 'Campagnes', undefined]);
    });

    it('should delete each action dimension after the trackEvent hit so it does not leak to later hits', () => {
        matomo.setTrackingEnabled(true);

        matomo.trackInteractionEvent(matomoEvents.actions.filter_applied, campaignPanel, ['fr']);

        const trackIdx = window._paq!.findIndex(entry => entry[0] === 'trackEvent');
        const deleteEntries = window._paq!.filter(entry => entry[0] === 'deleteCustomDimension');

        // one delete per set dimension (2/3/4), all pushed AFTER the trackEvent hit
        expect(deleteEntries).toHaveLength(3);
        window._paq!.forEach((entry, index) => {
            if (entry[0] === 'deleteCustomDimension') {
                expect(index).toBeGreaterThan(trackIdx);
            }
        });
        expect(window._paq).toContainEqual(['deleteCustomDimension', 2]);
        expect(window._paq).toContainEqual(['deleteCustomDimension', 3]);
        expect(window._paq).toContainEqual(['deleteCustomDimension', 4]);
    });

    it('should not leak action dimensions onto a subsequent navigation event', () => {
        matomo.setTrackingEnabled(true);

        matomo.trackInteractionEvent(matomoEvents.actions.filter_applied, campaignPanel, ['fr']);
        const paqLengthAfterInteraction = window._paq!.length;

        matomo.trackNavigationEvent(matomoEvents.actions.workspace_clicked, 'some workspace');

        // The navigation event pushed by the second call must set NO custom dimension of its own.
        const navPhase = window._paq!.slice(paqLengthAfterInteraction);
        expect(navPhase.some(entry => entry[0] === 'setCustomDimension')).toBe(false);
        expect(navPhase).toContainEqual([
            'trackEvent',
            'Navigation',
            matomoEvents.actions.workspace_clicked,
            'some workspace',
            undefined,
        ]);
    });
});
