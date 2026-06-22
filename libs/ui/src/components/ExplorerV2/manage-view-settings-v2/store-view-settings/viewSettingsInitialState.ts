import {ViewV2Types} from '_ui/_gqlTypes';
import {type IViewSettingsState} from './viewSettingsReducer';

export const defaultPageSizeOptions = [20, 50];

export const DefaultViewId = null;

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
    pageSize: defaultPageSizeOptions[0],
    massSelection: [],
};
