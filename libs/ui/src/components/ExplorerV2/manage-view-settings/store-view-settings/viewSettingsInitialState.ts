import {type IViewSettingsState} from './viewSettingsReducer';

export const defaultPageSizeOptions = [20, 50];

export const DefaultViewId = null;

export const viewSettingsInitialState: IViewSettingsState = {
    libraryId: '',
    viewType: 'table',
    viewId: DefaultViewId,
    viewModified: false,
    viewLabels: {},
    savedViews: [],
    entrypoint: {
        type: 'library',
        libraryId: '',
    },
    attributesIds: [],
    fulltextSearch: '',
    sort: [],
    pageSize: defaultPageSizeOptions[0],
    massSelection: [],
    initialViewSettings: {
        viewType: 'table',
        attributesIds: [],
        sort: [],
        pageSize: defaultPageSizeOptions[0],
    },
    defaultViewSettings: {
        viewType: 'table',
        attributesIds: [],
        sort: [],
        filters: [],
    },
    enableConfigureView: false,
};
