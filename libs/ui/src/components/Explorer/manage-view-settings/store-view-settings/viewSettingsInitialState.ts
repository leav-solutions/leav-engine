// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txtexport
import {IViewSettingsState} from './viewSettingsReducer';

export const defaultPageSizeOptions = [20, 50, 100];

export const defaultMaxFilters = 3;

export const viewSettingsInitialState: IViewSettingsState = {
    libraryId: null as unknown as string, //TODO: clean this
    viewType: 'table',
    entrypoint: {
        type: 'library',
        libraryId: ''
    },
    attributesIds: [],
    fulltextSearch: '',
    sort: [],
    pageSize: defaultPageSizeOptions[0],
    filters: [],
    maxFilters: defaultMaxFilters,
    initialViewSettings: {
        viewType: 'table',
        attributesIds: [],
        sort: [],
        pageSize: defaultPageSizeOptions[0],
        filters: []
    }
};
