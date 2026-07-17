import {localizedTranslation} from '@leav/utils';
import {type Panel} from '_ui/hooks/usePanelMessenger/types';
import {DIM_COMPARISON_MODE, DIM_PAGE_TYPE, DIM_PANEL_NAME, matomoEvents} from './constants/matomoEvents';

/**
 * Builds the 3 Action-scope Matomo custom dimensions for a generic panel:
 *  - Page type: category label from panel.type
 *  - Panel Name: localized panel.name, falling back to panel.id
 *  - Comparaison Mode: always 'false' (no comparison concept)
 */
export const resolveActionDimensions = (panel: Panel, lang: string[]): Record<number, string> => {
    const dimensions: Record<number, string> = {
        [DIM_PANEL_NAME]: localizedTranslation(panel.name, lang) || panel.id,
        [DIM_COMPARISON_MODE]: 'false',
    };

    const pageType = matomoEvents.pageTypes[panel.type];
    if (pageType) {
        dimensions[DIM_PAGE_TYPE] = pageType;
    }

    return dimensions;
};
