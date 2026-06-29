import {type Application} from '../../types';
import {getIsViewSettingsVoletActive} from '../getIsViewSettingsVoletActive';

type Panel = Application['libraries'][string]['libraryPanels'][number];

describe('getIsViewSettingsVoletActive', () => {
    it('should be true for an explorer panel with view settings active', () => {
        const panel: Panel = {id: 'panel1', type: 'explorer', actions: [], isViewSettingsActive: true};

        expect(getIsViewSettingsVoletActive(panel)).toBe(true);
    });

    it('should be false for an explorer panel with view settings inactive', () => {
        const panel: Panel = {id: 'panel1', type: 'explorer', actions: [], isViewSettingsActive: false};

        expect(getIsViewSettingsVoletActive(panel)).toBe(false);
    });

    it('should be false for a non-explorer panel', () => {
        const panel: Panel = {id: 'panel1', type: 'editionForm', formId: 'edition'};

        expect(getIsViewSettingsVoletActive(panel)).toBe(false);
    });

    it('should be false when no panel is resolved', () => {
        expect(getIsViewSettingsVoletActive(null)).toBe(false);
    });
});
