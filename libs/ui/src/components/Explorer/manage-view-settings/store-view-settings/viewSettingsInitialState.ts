// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txtexport {useViewSettingsContext} from './store-view-settings/useViewSettingsContext';
import {IViewSettingsState} from './viewSettingsReducer';

export const defaultPageSizeOptions = [20, 50, 100];

export const viewSettingsInitialState: IViewSettingsState = {
    viewType: 'table',
    attributesIds: [],
    sort: [],
    pageSize: defaultPageSizeOptions[0]
};
