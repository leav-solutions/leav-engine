import {type SerializedViewV2} from '@leav/ui';
import {type GetViewV2Query, type SortOrder} from '../../../../../__generated__';
import {IDENTITY_COLUMN_ID} from '../tabs/tab-display/_constants';

/**
 * Pure converter from a fetched viewV2 to the `SerializedView` contract consumed by ExplorerV2's
 * controlled `currentView` prop.
 *
 * - `attributesIds`: visible display attributes, excluding the hard-coded identity column.
 * - `sort`: the view sorts in their applied order. The array order IS the sort priority. Link-attribute
 *   descent (a path of several attributes per sort) is not supported yet, so the sort targets a single
 *   attribute: we take the last attribute of the path as the field (consistent with the volet's label).
 *   A sort with no attribute is skipped — it has no field to sort on.
 * - `filters`: left empty for now — user filters are handled in a follow-up ticket (the viewV2 tabs are
 *   still WIP). Masked (`hidden:true`) pre-filters are NOT added here: they are injected by the caller
 *   into `currentView.filters`.
 */
export const viewV2ToSerializedView = (view: GetViewV2Query['viewV2']): SerializedViewV2 => ({
    viewId: view.id,
    viewLabels: view.label,
    viewType: view.display.type as SerializedViewV2['viewType'],
    attributesIds: view.display.attributes
        .filter(({visible, attribute}) => visible && attribute.id !== IDENTITY_COLUMN_ID)
        .map(({attribute}) => attribute.id),
    sort: view.sorts
        .map(sort => ({field: sort.attributes.at(-1)?.id, order: sort.order}))
        .filter((sort): sort is {field: string; order: SortOrder} => sort.field !== undefined),
    filters: [],
});
