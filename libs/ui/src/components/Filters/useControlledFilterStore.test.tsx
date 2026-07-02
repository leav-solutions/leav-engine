import {act, renderHook, waitFor} from '@testing-library/react';
import {AttributeFormat, AttributeType, RecordFilterCondition, useExplorerAttributesQuery} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FiltersActionTypes} from './context/filtersReducer';
import {useControlledFilterStore} from './useControlledFilterStore';
import {type IUIFilterSmartFiler, type IUIFilterTree, type UIFilter} from './_types';
import {type SerializedFilter} from '../ExplorerV2/_types';

vi.mock('_ui/_gqlTypes', async () => ({
    ...(await vi.importActual('_ui/_gqlTypes')),
    useExplorerAttributesQuery: vi.fn(),
}));

vi.mock('_ui/hooks/useSharedTranslation', () => ({useSharedTranslation: vi.fn()}));
vi.mock('_ui/hooks/useLang/useLang');

// Tree resolution is exercised at the ExplorerV2 / live-stack level; here it is stubbed (no Apollo). It
// resolves each pending tree filter's recordIds → nodes, and MUST return a referentially-stable object
// per input signature (the real hook keeps it in useState) — a fresh object each render would flip the
// SEED effect's `resolvedById` dep and loop.
// Smart-filter label resolution (value ids → labels) is exercised against the live stack; here it is
// stubbed. It returns a fixed value→label map per smart filter, cached per input signature so a fresh
// object every render doesn't flip the reconciliation effect's dep and loop.
vi.mock('./useResolveSmartFilterLabels', () => {
    const labelByValue: Record<string, string> = {t1: 'Toussaint', t2: "Loisirs d'extérieur", t3: 'Bricolage'};
    const cache = new Map<string, {labelsById: Record<string, Record<string, string>>; loading: boolean}>();
    return {
        useResolveSmartFilterLabels: (smartFilters: Array<{id: string}>) => {
            const signature = JSON.stringify(smartFilters.map(filter => filter.id));
            if (!cache.has(signature)) {
                const labelsById: Record<string, Record<string, string>> = {};
                smartFilters.forEach(filter => {
                    labelsById[filter.id] = labelByValue;
                });
                cache.set(signature, {labelsById, loading: false});
            }
            return cache.get(signature);
        },
    };
});

vi.mock('./useResolveTreeFilterNodes', () => {
    const cache = new Map<string, {resolvedById: Record<string, unknown>; loading: boolean}>();
    return {
        useResolveTreeFilterNodes: (treeFilters: Array<{id: string; recordIds: string[]}>) => {
            const signature = JSON.stringify(treeFilters.map(filter => [filter.id, filter.recordIds]));
            if (!cache.has(signature)) {
                const resolvedById: Record<string, unknown> = {};
                treeFilters.forEach(filter => {
                    resolvedById[filter.id] = filter.recordIds.map(recordId => ({
                        nodeId: `node-${recordId}`,
                        libraryId: 'tree_lib',
                        recordId,
                        label: `Label ${recordId}`,
                    }));
                });
                cache.set(signature, {resolvedById, loading: false});
            }
            return cache.get(signature);
        },
    };
});

const STATUS_ATTRIBUTE = {
    id: 'status',
    label: {fr: 'Statut'},
    type: AttributeType.simple,
    format: AttributeFormat.text,
    multiple_values: false,
    permissions: {access_attribute: true},
};

const TREE_ATTRIBUTE = {
    id: 'category',
    label: {fr: 'Catégorie'},
    type: AttributeType.tree,
    format: null,
    multiple_values: true,
    permissions: {access_attribute: true},
    linked_tree: {id: 'categories_tree'},
};

// A LINK attribute with smart_filter enabled: toUIFilters types it as a scalar-valued IUIFilterLink, but
// isUIFilterWithSmartFilter reclassifies it as a smart filter (array-valued). The ViewV2 converter must
// re-inject the FULL stored array so it round-trips as string[] (a scalar crashes prepareFiltersForRequest).
const SMART_LINK_ATTRIBUTE = {
    id: 'campaign_type',
    label: {fr: 'Type de campagne'},
    type: AttributeType.advanced_link,
    format: null,
    multiple_values: true,
    permissions: {access_attribute: true},
    linked_library: {id: 'campaign_types'},
    smart_filter: {enable: true},
};

const leanSmart = (values: Array<string | null>, condition = RecordFilterCondition.EQUAL): SerializedFilter => ({
    attributes: [{id: 'campaign_type'}],
    condition,
    values,
    pinned: true,
});

const leanStatus = (values: Array<string | null>, condition = RecordFilterCondition.EQUAL): SerializedFilter => ({
    attributes: [{id: 'status'}],
    condition,
    values,
    pinned: true,
});

describe('useControlledFilterStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useSharedTranslation).mockReturnValue({
            t: (key: string) => key,
        } as unknown as ReturnType<typeof useSharedTranslation>);
        vi.mocked(useExplorerAttributesQuery).mockReturnValue({
            data: {attributes: {list: [STATUS_ATTRIBUTE, TREE_ATTRIBUTE, SMART_LINK_ATTRIBUTE]}},
            loading: false,
        } as unknown as ReturnType<typeof useExplorerAttributesQuery>);
    });

    it('seeds the lean filters into the store as full UIFilters', async () => {
        const {result} = renderHook(() =>
            useControlledFilterStore({leanFilters: [leanStatus(['active'])], libraryId: 'lib', viewId: 'v1'}),
        );

        await waitFor(() => expect(result.current.filtersData.filters).toHaveLength(1));
        const [filter] = result.current.filtersData.filters as UIFilter[];
        expect(filter.id).toBe('status');
        expect(filter.value).toBe('active');
    });

    it('does NOT emit onChange when seeding (echo-suppressed)', async () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useControlledFilterStore({leanFilters: [leanStatus(['active'])], libraryId: 'lib', onChange}),
        );

        await waitFor(() => expect(result.current.filtersData.filters).toHaveLength(1));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('does NOT re-emit when the SAME lean filters are pushed again (echo)', async () => {
        const onChange = vi.fn();
        const {result, rerender} = renderHook(
            ({leanFilters}) => useControlledFilterStore({leanFilters, libraryId: 'lib', onChange}),
            {initialProps: {leanFilters: [leanStatus(['active'])]}},
        );

        await waitFor(() => expect(result.current.filtersData.filters).toHaveLength(1));
        // A fresh array with identical content (what PanelAttributeExplorer rebuilds every render).
        rerender({leanFilters: [leanStatus(['active'])]});
        await waitFor(() => expect(result.current.filtersData.filters).toHaveLength(1));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('emits the whole lean set ONCE on a local edit', async () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useControlledFilterStore({leanFilters: [leanStatus(['active'])], libraryId: 'lib', onChange}),
        );

        await waitFor(() => expect(result.current.filtersData.filters).toHaveLength(1));
        const [filter] = result.current.filtersData.filters as UIFilter[];

        act(() => {
            result.current.dispatch({
                type: FiltersActionTypes.CHANGE_FILTER_CONFIG,
                payload: {...filter, value: 'paris'} as UIFilter,
            });
        });

        await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
        expect(onChange).toHaveBeenCalledWith([
            {
                attributes: [{id: 'status'}],
                condition: RecordFilterCondition.EQUAL,
                values: ['paris'],
                pinned: true,
                withEmptyValues: false,
            },
        ]);
    });

    it('adopts an external value change coming from the hub WITHOUT emitting', async () => {
        const onChange = vi.fn();
        const {result, rerender} = renderHook(
            ({leanFilters}) => useControlledFilterStore({leanFilters, libraryId: 'lib', onChange}),
            {initialProps: {leanFilters: [leanStatus(['active'])]}},
        );

        await waitFor(() => expect((result.current.filtersData.filters[0] as UIFilter).value).toBe('active'));

        // The OTHER spoke edited the value → it arrives through the hub (same structure, new value).
        rerender({leanFilters: [leanStatus(['archived'])]});

        await waitFor(() => expect((result.current.filtersData.filters[0] as UIFilter).value).toBe('archived'));
        // Adoption is a hub→store sync, never a local edit → the host is not notified back.
        expect(onChange).not.toHaveBeenCalled();
    });

    it('adopts a TREE value pushed by the hub (recordIds → resolved nodes), like the volet→explorer flow', async () => {
        const onChange = vi.fn();
        const treeLean = (values: string[]): SerializedFilter => ({
            attributes: [{id: 'category'}],
            condition: RecordFilterCondition.EQUAL,
            values,
            pinned: true,
        });
        const {result, rerender} = renderHook(
            ({leanFilters}) => useControlledFilterStore({leanFilters, libraryId: 'lib', onChange}),
            {initialProps: {leanFilters: [treeLean([])]}},
        );

        // Empty tree → seeded empty, no nodes, no request.
        await waitFor(() => expect(result.current.filtersData.filters).toHaveLength(1));
        expect((result.current.filtersData.filters[0] as IUIFilterTree).userNodes ?? null).toBeNull();

        // The volet selected a node → its recordId arrives through the hub as a lean value.
        rerender({leanFilters: [treeLean(['rec1'])]});

        await waitFor(() => {
            const adopted = result.current.filtersData.filters[0] as IUIFilterTree;
            expect(adopted.value).toEqual(['rec1']);
        });
        const tree = result.current.filtersData.filters[0] as IUIFilterTree;
        // The resolved nodes carry the libraryId → prepareFiltersForRequest can build `attr.<lib>.id`.
        expect(tree.nodes).toEqual([{nodeId: 'node-rec1', libraryId: 'tree_lib'}]);
        expect(tree.userNodes).toEqual([{nodeId: 'node-rec1', libraryId: 'tree_lib'}]);
        // Adoption is a hub→store sync → no echo back to the host.
        expect(onChange).not.toHaveBeenCalled();
    });

    it('adopts a CHANGED tree value from the hub even when a selection already exists (LEAVC-810 fix)', async () => {
        const treeLean = (values: string[]): SerializedFilter => ({
            attributes: [{id: 'category'}],
            condition: RecordFilterCondition.EQUAL,
            values,
            pinned: true,
        });
        // Start with an already-selected tree (e.g. a saved view value) → the store resolves it.
        const {result, rerender} = renderHook(
            ({leanFilters}) => useControlledFilterStore({leanFilters, libraryId: 'lib'}),
            {initialProps: {leanFilters: [treeLean(['rec1'])]}},
        );
        await waitFor(() => expect((result.current.filtersData.filters[0] as IUIFilterTree).value).toEqual(['rec1']));

        // The volet changes the tree to a DIFFERENT node → its recordId arrives through the hub.
        rerender({leanFilters: [treeLean(['rec2'])]});

        await waitFor(() => expect((result.current.filtersData.filters[0] as IUIFilterTree).value).toEqual(['rec2']));
        const tree = result.current.filtersData.filters[0] as IUIFilterTree;
        expect(tree.nodes).toEqual([{nodeId: 'node-rec2', libraryId: 'tree_lib'}]);
    });

    it('excludes a tree filter with no user selection from the projection (no spurious emit)', async () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useControlledFilterStore({
                leanFilters: [
                    {attributes: [{id: 'category'}], condition: RecordFilterCondition.EQUAL, values: [], pinned: true},
                ],
                libraryId: 'lib',
                onChange,
            }),
        );

        await waitFor(() => expect(result.current.filtersData.filters).toHaveLength(1));
        // The tree filter is seeded empty (userNodes null) → excluded from the lean projection → no emit.
        expect(onChange).not.toHaveBeenCalled();
    });

    it('adopts a withEmptyValues flip pushed by the hub on a tree (RESET_VIEW / other spoke) keeping its nodes', async () => {
        const treeLean = (values: string[], withEmptyValues: boolean): SerializedFilter => ({
            attributes: [{id: 'category'}],
            condition: RecordFilterCondition.EQUAL,
            values,
            pinned: true,
            withEmptyValues,
        });
        const {result, rerender} = renderHook(
            ({leanFilters}) => useControlledFilterStore({leanFilters, libraryId: 'lib'}),
            {initialProps: {leanFilters: [treeLean(['rec1'], true)]}},
        );

        await waitFor(() => {
            const tree = result.current.filtersData.filters[0] as IUIFilterTree;
            expect(tree.value).toEqual(['rec1']);
            expect(tree.withEmptyValues).toBe(true);
        });

        // Hub reverts "non défini" to false WITHOUT changing the selected nodes (same recordIds) — the
        // SEED merge won't re-run (no structural/resolution change), so ADOPT must carry the flag.
        rerender({leanFilters: [treeLean(['rec1'], false)]});

        await waitFor(() =>
            expect((result.current.filtersData.filters[0] as IUIFilterTree).withEmptyValues).toBe(false),
        );
        const tree = result.current.filtersData.filters[0] as IUIFilterTree;
        // The node selection is preserved (only the flag changed).
        expect(tree.userNodes).toEqual([{nodeId: 'node-rec1', libraryId: 'tree_lib'}]);
    });

    it('RESET_FILTER on a tree restores the SAVED nodes, not the live edited ones', async () => {
        const treeLean = (values: string[]): SerializedFilter => ({
            attributes: [{id: 'category'}],
            condition: RecordFilterCondition.EQUAL,
            values,
            pinned: true,
        });
        // Saved view has the tree filtering on rec1.
        const {result, rerender} = renderHook(
            ({leanFilters}) => useControlledFilterStore({leanFilters, libraryId: 'lib'}),
            {initialProps: {leanFilters: [treeLean(['rec1'])]}},
        );
        await waitFor(() => expect((result.current.filtersData.filters[0] as IUIFilterTree).value).toEqual(['rec1']));

        // User picks a different node (rec2) → the edit round-trips through the hub (new lean value). This is
        // a value change, NOT structural, so the saved (rec1) resolution stays pinned as the reset target.
        rerender({leanFilters: [treeLean(['rec2'])]});
        await waitFor(() => expect((result.current.filtersData.filters[0] as IUIFilterTree).value).toEqual(['rec2']));

        // Reset from the filter dropdown → back to the SAVED node (rec1), not the current rec2.
        act(() => {
            result.current.dispatch({type: FiltersActionTypes.RESET_FILTER, payload: {id: 'category'}});
        });

        await waitFor(() => expect((result.current.filtersData.filters[0] as IUIFilterTree).value).toEqual(['rec1']));
        const tree = result.current.filtersData.filters[0] as IUIFilterTree;
        expect(tree.userNodes).toEqual([{nodeId: 'node-rec1', libraryId: 'tree_lib'}]);
    });

    it('seeds a smart-filter link with the FULL stored value array (LEAVC-810 — no scalar crash)', async () => {
        // Regression: toUIFilters restores only the first value as a SCALAR IUIFilterLink; without the
        // smart-filter re-injection the store would hold `value: 't1'` and prepareFiltersForRequest would
        // throw "value.forEach is not a function".
        const {result} = renderHook(() =>
            useControlledFilterStore({leanFilters: [leanSmart(['t1', 't2', 't3'])], libraryId: 'lib'}),
        );

        await waitFor(() => expect(result.current.filtersData.filters).toHaveLength(1));
        const [filter] = result.current.filtersData.filters as UIFilter[];
        expect(filter.value).toEqual(['t1', 't2', 't3']);
    });

    it('resolves smart-filter LABELS (formattedValue) so the chip stays in sync across spokes', async () => {
        // The lean hub carries value ids only; without label resolution the receiving spoke's chip shows
        // a stale/empty formattedValue while the value updates (the reported toolbar⇄volet desync).
        const {result, rerender} = renderHook(
            ({leanFilters}) => useControlledFilterStore({leanFilters, libraryId: 'lib'}),
            {initialProps: {leanFilters: [leanSmart(['t1'])]}},
        );

        await waitFor(() =>
            expect((result.current.filtersData.filters[0] as IUIFilterSmartFiler).formattedValue).toEqual([
                'Toussaint',
            ]),
        );

        // The other spoke adds a second value → only the id arrives through the hub; the label must be
        // resolved locally so the chip shows both, not the stale single value.
        rerender({leanFilters: [leanSmart(['t1', 't2'])]});

        await waitFor(() =>
            expect((result.current.filtersData.filters[0] as IUIFilterSmartFiler).formattedValue).toEqual([
                'Toussaint',
                "Loisirs d'extérieur",
            ]),
        );
    });

    it('adopts a smart-filter value pushed by the hub as an ARRAY (volet → explorer)', async () => {
        const onChange = vi.fn();
        const {result, rerender} = renderHook(
            ({leanFilters}) => useControlledFilterStore({leanFilters, libraryId: 'lib', onChange}),
            {initialProps: {leanFilters: [leanSmart(['t1'])]}},
        );
        await waitFor(() => expect((result.current.filtersData.filters[0] as UIFilter).value).toEqual(['t1']));

        // The other spoke (the volet) selected a second value → it arrives through the hub. The ADOPT
        // dispatch must carry an ARRAY, not the scalar seed, so the explorer's data query can be built.
        rerender({leanFilters: [leanSmart(['t1', 't2'])]});

        await waitFor(() => expect((result.current.filtersData.filters[0] as UIFilter).value).toEqual(['t1', 't2']));
        // Adoption is a hub→store sync → no echo back to the host.
        expect(onChange).not.toHaveBeenCalled();
    });

    it('seeds withEmptyValues from the lean filters', async () => {
        const {result} = renderHook(() =>
            useControlledFilterStore({
                leanFilters: [{...leanStatus(['active']), withEmptyValues: true}],
                libraryId: 'lib',
            }),
        );

        await waitFor(() => expect(result.current.filtersData.filters).toHaveLength(1));
        expect((result.current.filtersData.filters[0] as UIFilter).withEmptyValues).toBe(true);
    });

    it('emits a tree filter that has ONLY withEmptyValues (no user selection) instead of skipping it', async () => {
        const onChange = vi.fn();
        const {result} = renderHook(() =>
            useControlledFilterStore({
                leanFilters: [
                    {attributes: [{id: 'category'}], condition: RecordFilterCondition.EQUAL, values: [], pinned: true},
                ],
                libraryId: 'lib',
                onChange,
            }),
        );

        await waitFor(() => expect(result.current.filtersData.filters).toHaveLength(1));
        const [tree] = result.current.filtersData.filters as IUIFilterTree[];

        // User checks "non défini" on a tree with no node selection → the filter is now meaningful and
        // must round-trip to the hub (previously value-less trees were dropped from the projection).
        act(() => {
            result.current.dispatch({
                type: FiltersActionTypes.CHANGE_FILTER_CONFIG,
                payload: {...tree, withEmptyValues: true} as UIFilter,
            });
        });

        await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
        expect(onChange).toHaveBeenCalledWith([
            expect.objectContaining({attributes: [{id: 'category'}], withEmptyValues: true}),
        ]);
    });
});
