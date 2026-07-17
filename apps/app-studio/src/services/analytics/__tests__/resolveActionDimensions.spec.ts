import {describe, expect, it} from 'vitest';
import {resolveActionDimensions} from '../resolveActionDimensions';
import {DIM_COMPARISON_MODE, DIM_PAGE_TYPE, DIM_PANEL_NAME} from '../constants/matomoEvents';

describe('resolveActionDimensions', () => {
    const lang = ['fr', 'en'];

    it('should map an explorer panel to Page type "Explorer" with localized name and comparison false', () => {
        const dims = resolveActionDimensions(
            {id: 'campaigns', type: 'explorer', name: {fr: 'Campagnes', en: 'Campaigns'}} as any,
            lang,
        );
        expect(dims[DIM_PAGE_TYPE]).toBe('Explorer');
        expect(dims[DIM_PANEL_NAME]).toBe('Campagnes');
        expect(dims[DIM_COMPARISON_MODE]).toBe('false');
    });

    it('should map an editionForm panel to Page type "Edition form"', () => {
        const dims = resolveActionDimensions(
            {id: 'mapEdition', type: 'editionForm', name: {fr: 'Infos MAP', en: 'MAP informations'}} as any,
            lang,
        );
        expect(dims[DIM_PAGE_TYPE]).toBe('Edition form');
    });

    it('should fall back to panel.id when name is absent', () => {
        const dims = resolveActionDimensions({id: 'mapEdition', type: 'editionForm'} as any, lang);
        expect(dims[DIM_PANEL_NAME]).toBe('mapEdition');
    });

    it('should omit Page type for an unmapped panel type (e.g. custom)', () => {
        const dims = resolveActionDimensions({id: 'planning', type: 'custom'} as any, lang);
        expect(dims[DIM_PAGE_TYPE]).toBeUndefined();
    });
});
