import {type SerializedFilter} from '@leav/ui';
import {RecordFilterCondition} from '../../../../__generated__';
import {type AvailableAttribute} from '../panel-view-settings/store-current-view/_types';

/**
 * The path-derived id of a filter (mirror of `getFilterId` in the hub): the attribute ids joined by
 * `/`. A bare link is `"link"`, a through descends to `"link/subAttr"`.
 */
const pathId = (filter: Pick<SerializedFilter, 'attributes'>): string =>
    filter.attributes.map(attribute => attribute.id).join('/');

/** The base segment of a filter path (the first attribute id) — stable across a through descent. */
const baseSegment = (id: string): string => id.split('/')[0];

/**
 * A single reconciliation operation the hub must apply. `setConfig` edits an existing filter's value;
 * `rePath` moves an existing filter to a new attribute path (bare link → through, or sub-attribute
 * swap) while preserving its pin + position; `unpin` removes a filter chip that vanished from the
 * toolbar (a genuine removal).
 */
export type ToolbarFilterReconcileOp =
    | {
          type: 'setConfig';
          id: string;
          condition: RecordFilterCondition;
          values: Array<string | null>;
          withEmptyValues?: boolean;
      }
    | {
          type: 'rePath';
          oldId: string;
          attributes: AvailableAttribute[];
          condition: RecordFilterCondition;
          values: Array<string | null>;
          withEmptyValues?: boolean;
      }
    | {type: 'unpin'; id: string};

/**
 * Reconciles the WHOLE lean filter set emitted by ExplorerV2's toolbar store against the hub view.
 *
 * The core subtlety this fixes: a filter's hub identity is derived from its attribute PATH, and a
 * through filter changes that path mid-edit (`link` → `link/subAttr`). A naive reconciliation would
 * see the new path as an unknown filter (config lost) AND the old path as a vanished pinned filter
 * (unpinned → chip drops from the toolbar). We instead detect the path change as a **re-path** of the
 * existing filter, preserving its pin + position.
 *
 * A filter is a re-path (not an add/remove) when its id is absent from the hub AND exactly one hub
 * filter has vanished (absent from the incoming set) sharing the same base segment.
 *
 * @param incoming    the full lean set from the toolbar store
 * @param hubFilters  the hub's current filters, with their pin state (both pinned and unpinned)
 */
export const reconcileToolbarFilters = (
    incoming: SerializedFilter[],
    hubFilters: Array<{id: string; pinned: boolean}>,
): ToolbarFilterReconcileOp[] => {
    const incomingIds = new Set(incoming.map(pathId));
    const hubIds = new Set(hubFilters.map(filter => filter.id));
    const vanished = hubFilters.filter(filter => !incomingIds.has(filter.id));
    const consumed = new Set<string>();
    const ops: ToolbarFilterReconcileOp[] = [];

    incoming.forEach(inc => {
        const id = pathId(inc);
        const condition = inc.condition ?? RecordFilterCondition.EQUAL;

        if (hubIds.has(id)) {
            ops.push({type: 'setConfig', id, condition, values: inc.values, withEmptyValues: inc.withEmptyValues});
            return;
        }

        const base = inc.attributes[0]?.id;
        const source = vanished.find(filter => baseSegment(filter.id) === base && !consumed.has(filter.id));

        if (source) {
            consumed.add(source.id);
            ops.push({
                type: 'rePath',
                oldId: source.id,
                attributes: inc.attributes,
                condition,
                values: inc.values,
                withEmptyValues: inc.withEmptyValues,
            });
        }
        // else: a genuinely new filter — never happens from the toolbar (filters are created in the
        // volet or the admin gear), so no-op.
    });

    // A pinned hub filter absent from the incoming set was removed from the toolbar → unpin it. Skip
    // the ones already consumed by a re-path (their old path is gone but the filter lives on).
    hubFilters.forEach(hubFilter => {
        if (hubFilter.pinned && !incomingIds.has(hubFilter.id) && !consumed.has(hubFilter.id)) {
            ops.push({type: 'unpin', id: hubFilter.id});
        }
    });

    return ops;
};
