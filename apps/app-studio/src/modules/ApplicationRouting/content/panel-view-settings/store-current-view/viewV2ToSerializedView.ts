import {type SerializedViewV2} from '@leav/ui';
import {type GetViewV2Query} from '../../../../../__generated__';
import {IDENTITY_COLUMN_ID} from '../tabs/tab-display/_constants';

/**
 * Pure converter from a fetched viewV2 to the `SerializedView` contract consumed by ExplorerV2's
 * controlled `currentView` prop.
 *
 * - `attributesIds`: visible display attributes, excluding the hard-coded identity column.
 * - `sort` / `filters`: left empty for now — multi-attribute sorts and user filters are handled in
 *   follow-up tickets (the viewV2 tabs are still WIP). Masked (`hidden:true`) pre-filters are NOT
 *   added here: they are injected by the caller into `currentView.filters`.
 */
export const viewV2ToSerializedView = (view: GetViewV2Query['viewV2']): SerializedViewV2 => ({
    viewId: view.id,
    viewLabels: view.label,
    viewType: view.display.type as SerializedViewV2['viewType'],
    attributesIds: view.display.attributes
        .filter(({visible, attribute}) => visible && attribute.id !== IDENTITY_COLUMN_ID)
        .map(({attribute}) => attribute.id),
    sort: [],
    filters: [],
});
