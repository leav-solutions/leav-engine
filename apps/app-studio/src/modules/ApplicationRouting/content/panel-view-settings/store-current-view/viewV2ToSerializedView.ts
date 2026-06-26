import {type SerializedViewV2} from '@leav/ui';
import {type GetViewV2Query, type SortOrder} from '../../../../../__generated__';
import {IDENTITY_COLUMN_ID} from '../tabs/tab-display/_constants';

/**
 * Pure converter from a fetched viewV2 to the `SerializedView` contract consumed by ExplorerV2's
 * controlled `currentView` prop.
 *
 * - `attributesIds`: visible display attributes, excluding the hard-coded identity column.
 * - `sort`: the pinned view sorts only, in their applied order. The array order IS the sort priority.
 *   Unpinned sorts are configured but not applied (mirrors hidden display columns). The field is
 *   the descent path joined by '.', the format the records query understands (e.g. `campaigns.label`
 *   sorts on a linked attribute, `campaigns` alone sorts on the linked record identity — see core's
 *   `getAttributesFromField`). A single-attribute sort just yields that attribute id.
 *   A sort with no attribute is skipped — it has no field to sort on.
 * - `filters`: left empty for now — user filters are handled in a follow-up ticket (the viewV2 tabs are
 *   still WIP). Masked (`hidden:true`) pre-filters are NOT added here: they are injected by the caller
 *   into `currentView.filters`.
 * - `shortcuts`: the view-settings tabs exposed as direct shortcuts. The API already defaults this to
 *   `['display']`, the `??` is a defensive fallback.
 */
export const viewV2ToSerializedView = (view: GetViewV2Query['viewV2']): SerializedViewV2 => ({
    viewId: view.id,
    viewLabels: view.label,
    viewType: view.display.type as SerializedViewV2['viewType'],
    attributesIds: view.display.attributes
        .filter(({visible, attribute}) => visible && attribute.id !== IDENTITY_COLUMN_ID)
        .map(({attribute}) => attribute.id),
    sort: view.sorts
        .filter(sort => sort.pinned)
        .map(sort => ({field: sort.attributes.map(attribute => attribute.id).join('.'), order: sort.order}))
        .filter((sort): sort is {field: string; order: SortOrder} => sort.field !== ''),
    filters: [],
    shortcuts: (view.shortcuts ?? ['display']) as SerializedViewV2['shortcuts'],
});
