// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ViewTypes} from '_ui/_gqlTypes';
import {ViewType} from './manage-view-settings/store-view-settings/viewSettingsReducer';

//TODO: this mapping is here for backward compatibility. When the old explorer is removed, we should updates types on the backend and remove this mapping
export const mapViewTypeFromExplorerToLegacy: Record<ViewType, ViewTypes> = {
    table: ViewTypes.list,
    mosaic: ViewTypes.cards,
    timeline: ViewTypes.timeline,
    list: ViewTypes.list
};

export const mapViewTypeFromLegacyToExplorer: Record<ViewTypes, ViewType> = {
    [ViewTypes.list]: 'table',
    [ViewTypes.cards]: 'mosaic',
    [ViewTypes.timeline]: 'timeline'
};

export const MASS_SELECTION_ALL = 'all';
