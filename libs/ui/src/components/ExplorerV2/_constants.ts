import {ViewTypes} from '_ui/_gqlTypes';
import {type ViewType} from './manage-view-settings/store-view-settings/viewSettingsReducer';

//TODO: this mapping is here for backward compatibility. When the old explorer is removed, we should updates types on the backend and remove this mapping
export const mapViewTypeFromExplorerToLegacy: Record<ViewType, ViewTypes> = {
    table: ViewTypes.list,
    mosaic: ViewTypes.cards,
    timeline: ViewTypes.timeline,
    list: ViewTypes.list,
};

export const mapViewTypeFromLegacyToExplorer: Record<ViewTypes, ViewType> = {
    [ViewTypes.list]: 'table',
    [ViewTypes.cards]: 'mosaic',
    [ViewTypes.timeline]: 'timeline',
};

export const MASS_SELECTION_ALL = 'all';

export const LINK_RECORDS_MODAL_CLASSNAME = 'link-modal';

export const CREATE_RECORD_MODAL_CLASSNAME = 'create-record-modal';

export const EDIT_RECORD_MODAL_CLASSNAME = 'edit-record-modal';

export const WHO_AM_I_COLUMN = 'whoAmI';

export const SNACKBAR_MASS_ID = 'SNACKBAR_MASS_ID';
