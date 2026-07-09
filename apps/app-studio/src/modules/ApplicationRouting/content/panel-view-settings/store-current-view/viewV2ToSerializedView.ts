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
 * - `filters`: the PINNED user filters only, in their view-defined order (= toolbar order), in the LEAN
 *   serializable shape (`{attributes, condition, values, pinned}`). Unpinned filters are configured but
 *   not applied (mirrors unpinned sorts / hidden display columns). User filters travel through the
 *   controlled view again — the ADR-006 "filters out of currentView" deviation is CANCELLED (LEAVC-810):
 *   the lean form is message-ready (an iframe panel can be driven the same way), whereas a full `UIFilter`
 *   is not serializable. Masked (`hidden:true`) pre-filters are injected SEPARATELY by the caller (e.g.
 *   PanelAttributeExplorer) into `currentView.filters` and merged into the records request by ExplorerV2.
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
    // The grouping axis (kanban columns): the id of the single display attribute flagged `isGroupBy`,
    // or undefined when no axis is set. Generic — display-mode-agnostic (see SerializedView).
    groupByAttributeId: view.display.attributes.find(({isGroupBy}) => isGroupBy)?.attribute.id,
    sort: view.sorts
        .filter(sort => sort.pinned)
        .map(sort => ({field: sort.attributes.map(attribute => attribute.id).join('.'), order: sort.order}))
        .filter((sort): sort is {field: string; order: SortOrder} => sort.field !== ''),
    filters: view.filters
        .filter(filter => filter.pinned)
        .map(filter => ({
            attributes: filter.attributes.map(attribute => ({id: attribute.id, label: attribute.label})),
            condition: filter.condition,
            values: filter.values,
            pinned: true,
            withEmptyValues: filter.withEmptyValues ?? false,
        })),
    shortcuts: (view.shortcuts ?? ['display']) as SerializedViewV2['shortcuts'],
    displaySettings: view.display.settings ?? undefined,
});
