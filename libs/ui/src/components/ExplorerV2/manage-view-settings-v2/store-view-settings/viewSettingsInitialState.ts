import {ViewV2Types} from '_ui/_gqlTypes';
import {type ViewSettingsShortcuts} from '../../_types';
import {type IViewSettingsState} from './viewSettingsReducer';

export const defaultPageSizeOptions = [20, 50];

export const DefaultViewId = null;

/**
 * Shortcuts shown when a view does not specify any. Mirrors the API default (`['display']`) and is
 * used both as the ephemeral fallback and when merging the controlled `currentView` prop.
 */
export const DEFAULT_VIEW_SHORTCUTS: ViewSettingsShortcuts[] = ['display'];

export const viewSettingsInitialState: IViewSettingsState = {
    libraryId: '',
    entrypoint: {
        type: 'library',
        libraryId: '',
    },
    viewId: DefaultViewId,
    viewLabels: {},
    viewType: ViewV2Types.list,
    attributesIds: [],
    fulltextSearch: '',
    sort: [],
    shortcuts: DEFAULT_VIEW_SHORTCUTS,
    pageSize: defaultPageSizeOptions[0],
    massSelection: [],
};
