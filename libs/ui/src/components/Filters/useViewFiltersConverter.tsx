import {useCallback, useMemo} from 'react';
import {RecordFilterCondition, useExplorerAttributesQuery} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type AttributesById, useTransformFilters} from './useTransformFilters';
import {
    isUIFilterThrough,
    isUIFilterTree,
    isUIFilterWithSmartFilter,
    type IUIFilterTree,
    type UIFilter,
} from './_types';

/**
 * Minimal shape of a stored ViewV2 filter needed to rebuild a `UIFilter`. `attributes` is the descent
 * path (a single attribute for a direct filter, `[link, subAttribute]` for a descended one); `values`
 * holds the persisted value(s); `condition` is the stored filter condition.
 */
export interface IViewFilterToConvert {
    attributes: Array<{id: string}>;
    condition: RecordFilterCondition | null;
    values: Array<string | null>;
    withEmptyValues?: boolean;
}

/** Stable id of a filter = its attribute path ids joined by '/', matching app-studio's `getFilterId`. */
const getPathKey = (attributes: Array<{id: string}>): string => attributes.map(attribute => attribute.id).join('/');

/**
 * Rebuild the attribute-path key of an already-built `UIFilter`, so a filter edited in the ExplorerV2
 * FilterToolBar can be matched back to its stored counterpart. Link filters never carry a trailing
 * `.id` here (that suffix is only added by `prepareFiltersForRequest` for the records query), but we
 * strip it defensively. A through filter's descended attribute lives in `subField`.
 */
const getUIFilterPathKey = (filter: UIFilter): string => {
    const base = (Array.isArray(filter.field) ? filter.field : String(filter.field).split('.')).filter(
        segment => segment !== 'id',
    );
    const path =
        isUIFilterThrough(filter) && filter.subField
            ? [
                  ...base,
                  ...String(filter.subField)
                      .split('.')
                      .filter(segment => segment !== 'id'),
              ]
            : base;

    return path.length > 0 ? path.join('/') : filter.attribute.id;
};

const getUIFilterValues = (filter: UIFilter): Array<string | null> => {
    const {value} = filter;
    if (value === null || value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
};

/**
 * Extracts the persistable `{id, condition, values}` config from a `UIFilter` (e.g. one edited in the
 * FilterToolBar or the filters tab editor). A through filter's effective condition is its
 * `subCondition` — that, with the descended path, is what `toUIFilters` rebuilds the through filter
 * from on the next round-trip.
 */
export const uiFilterToConfig = (
    filter: UIFilter,
): {id: string; condition: RecordFilterCondition; values: Array<string | null>; withEmptyValues?: boolean} => {
    const condition = isUIFilterThrough(filter) ? filter.subCondition : filter.condition;

    return {
        id: getUIFilterPathKey(filter),
        condition: (condition as RecordFilterCondition) ?? RecordFilterCondition.EQUAL,
        values: getUIFilterValues(filter),
        withEmptyValues: filter.withEmptyValues,
    };
};

/**
 * Bridges stored ViewV2 filters (raw `{attributes, condition, values}`) and the `UIFilter` machinery
 * reused from the Explorer (`CommonFilterItem` / `FilterDropDown` editors). Fetches the attribute
 * metadata (type, format, values list, linked library/tree, smart filter) needed to type each filter
 * and exposes:
 *
 * - `attributesDataById`: attribute details keyed by id (the same shape the FiltersProvider feeds).
 * - `toUIFilter(filter)`: converts one stored filter to a `UIFilter`, with a deterministic id (its
 *   attribute path) so it can be matched back, and the full stored `values` array preserved for
 *   array-typed filters (`toUIFilters` only restores the first value).
 * - `uiFilters`: all input filters converted (skipping any whose attribute is unavailable).
 */
export const useViewFiltersConverter = (viewFilters: IViewFilterToConvert[]) => {
    const {t} = useSharedTranslation();
    const {toValidFilters, toUIFilters} = useTransformFilters();

    const ids = useMemo(
        () => [...new Set(viewFilters.flatMap(filter => filter.attributes.map(attribute => attribute.id)))],
        [viewFilters],
    );

    const {data, loading} = useExplorerAttributesQuery({
        variables: {ids},
        skip: ids.length === 0,
    });

    const attributesDataById = useMemo<AttributesById>(
        () =>
            (data?.attributes?.list ?? []).reduce<AttributesById>((acc, attribute) => {
                if (attribute.permissions.access_attribute) {
                    acc[attribute.id] = attribute;
                }
                return acc;
            }, {}),
        [data],
    );

    const toUIFilter = useCallback(
        (filter: IViewFilterToConvert): UIFilter | null => {
            const [valid] = toValidFilters([
                {
                    field: filter.attributes.map(attribute => attribute.id).join('.'),
                    condition: filter.condition ?? undefined,
                    value: filter.values?.[0] ?? undefined,
                },
            ]);
            if (!valid) {
                return null;
            }

            const [uiFilter] = toUIFilters({filters: [valid], treeFilters: {}, attributesDataById, t});
            if (!uiFilter) {
                return null;
            }

            const converted: UIFilter = {
                ...uiFilter,
                id: getPathKey(filter.attributes),
                withEmptyValues: filter.withEmptyValues ?? false,
            };

            // TREE filters with STORED VALUES are seeded EMPTY: a stored tree value is a set of record ids
            // that must be resolved to `{nodeId, libraryId}` user-selections before it can be applied (and
            // the dropdown reads `userNodes`). Without that resolution (follow-up) a `value` without
            // `userNodes` would be treated by `prepareFiltersForRequest` as a "view-by-default" selection
            // and wrongly filter (e.g. `value OR IS_EMPTY`) even though nothing is checked. So we drop the
            // value here; the filter only applies once its nodes are resolved (useResolveTreeFilterNodes).
            //
            // A tree with NO stored values is an EXPLICIT empty selection (the user cleared it): seed it
            // with empty arrays (`userNodes: []`), NOT null. `null` reads as "not yet resolved" and makes
            // the SEED merge in useControlledFilterStore preserve a stale live selection on the receiving
            // spoke instead of clearing it to match the hub.
            if (isUIFilterTree(converted)) {
                const hasStoredValues = (filter.values ?? []).some(value => value !== null);
                const emptyTreeFilter: IUIFilterTree = hasStoredValues
                    ? {
                          ...converted,
                          value: null,
                          nodes: null,
                          userNodes: null,
                          userFormattedValue: null,
                          formattedValue: null,
                      }
                    : {
                          ...converted,
                          value: [],
                          nodes: [],
                          userNodes: [],
                          userFormattedValue: [],
                          formattedValue: [],
                      };
                return emptyTreeFilter;
            }

            // toUIFilters only restores the first stored value. For array-typed filters (values list,
            // smart filter) re-inject the FULL stored array so multi-value filters round-trip. A smart
            // filter on a LINK/STANDARD attribute is typed by toUIFilters as a scalar-valued filter (its
            // `value` is a plain string), so `Array.isArray` alone misses it — guard on the smart-filter
            // predicate too. Otherwise the scalar reaches prepareFiltersForRequest, which iterates it as
            // an array (`value.forEach`) and throws "value.forEach is not a function".
            if (Array.isArray(converted.value) || isUIFilterWithSmartFilter(converted)) {
                converted.value = (filter.values ?? []).filter((value): value is string => value !== null);
            }

            return converted;
        },
        // `toValidFilters`/`toUIFilters` are recreated on every render by `useTransformFilters` (and
        // `t` may be too): depending on their identity would make `toUIFilter` — and the serialized
        // view derived from it — a new object every render, looping ExplorerV2's controlled-view sync
        // (Maximum update depth). They are behaviorally stable, so we key only on the data inputs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [attributesDataById],
    );

    const uiFilters = useMemo(
        () => viewFilters.map(toUIFilter).filter((filter): filter is UIFilter => filter !== null),
        [viewFilters, toUIFilter],
    );

    return {uiFilters, attributesDataById, toUIFilter, loading};
};
