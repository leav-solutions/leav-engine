import {act, renderHook, waitFor} from '@testing-library/react';
import {AttributeFormat, AttributeType, RecordFilterCondition, useExplorerAttributesQuery} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FiltersActionTypes} from './context/filtersReducer';
import {useControlledFilterStore} from './useControlledFilterStore';
import {type IUIFilterTree, type UIFilter} from './_types';
import {type SerializedFilter} from '../ExplorerV2/_types';

jest.mock('_ui/_gqlTypes', () => ({
    ...jest.requireActual('_ui/_gqlTypes'),
    useExplorerAttributesQuery: jest.fn(),
}));

jest.mock('_ui/hooks/useSharedTranslation', () => ({useSharedTranslation: jest.fn()}));
jest.mock('_ui/hooks/useLang/useLang');

// Tree resolution is exercised at the ExplorerV2 / live-stack level; here it is stubbed (no Apollo). It
// resolves each pending tree filter's recordIds → nodes, and MUST return a referentially-stable object
// per input signature (the real hook keeps it in useState) — a fresh object each render would flip the
// SEED effect's `resolvedById` dep and loop.
jest.mock('./useResolveTreeFilterNodes', () => {
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

const leanStatus = (values: Array<string | null>, condition = RecordFilterCondition.EQUAL): SerializedFilter => ({
    attributes: [{id: 'status'}],
    condition,
    values,
    pinned: true,
});

describe('useControlledFilterStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useSharedTranslation as jest.Mock).mockReturnValue({t: (key: string) => key});
        (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
            data: {attributes: {list: [STATUS_ATTRIBUTE, TREE_ATTRIBUTE]}},
            loading: false,
        });
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
        const onChange = jest.fn();
        const {result} = renderHook(() =>
            useControlledFilterStore({leanFilters: [leanStatus(['active'])], libraryId: 'lib', onChange}),
        );

        await waitFor(() => expect(result.current.filtersData.filters).toHaveLength(1));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('does NOT re-emit when the SAME lean filters are pushed again (echo)', async () => {
        const onChange = jest.fn();
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
        const onChange = jest.fn();
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
            {attributes: [{id: 'status'}], condition: RecordFilterCondition.EQUAL, values: ['paris'], pinned: true},
        ]);
    });

    it('adopts an external value change coming from the hub WITHOUT emitting', async () => {
        const onChange = jest.fn();
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
        const onChange = jest.fn();
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
        const onChange = jest.fn();
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
});
