import {type MockedResponse} from '@apollo/client/testing';
import {act, renderHook, waitFor} from '_ui/_tests/testUtils';
import {
    ExplorerLibraryDataDocument,
    ListDistinctValuesDocument,
    RecordFilterCondition,
    RecordUpdateLightDocument,
    SortOrder,
    type RecordFilterInput,
} from '_ui/_gqlTypes';
import {KANBAN_COLUMN_PAGE_SIZE} from '../_constants';
import {NO_AXIS_VALUE_COLUMN_ID} from '../grouping/buildKanbanColumns';
import {appendGroupFilter, buildNoValueGroupFilter, buildTreeGroupEqualityFilter} from '../grouping/groupFilters';
import {type IKanbanDataSource} from '../_types';
import {useKanbanColumnsData} from './useKanbanColumnsData';

// ************* NOTE ******************
//
// This hook owns the risky per-column loading logic that the pure-function tests cannot reach:
// the imperative fan-out (one apolloClient.query per column), the stale-response guard by request
// signature, and the reset+reload ordering of its two effects. The suite drives it through
// MockedProvider (via renderHook), matching each column page by its exact request variables — a
// wrong offset, sort, search or group filter would simply not match its mock, so the assertions
// double as a contract check on the emitted queries.
//
const AXIS = 'status';
const LIBRARY = 'campaigns';
const NODE_LIB = 'statuses';
const ATTRIBUTE_IDS = ['label', 'status'];

const baseDataSource: IKanbanDataSource = {
    libraryId: LIBRARY,
    attributeIds: ATTRIBUTE_IDS,
    filters: [],
    searchQuery: '',
    sorts: [],
};

const eqFilter = (nodeRecordId: string, nodeLibraryId = NODE_LIB): RecordFilterInput =>
    buildTreeGroupEqualityFilter({attributeId: AXIS, nodeLibraryId, nodeRecordId});

const noValueFilter = (): RecordFilterInput => buildNoValueGroupFilter(AXIS);

const treeGroup = (nodeRecordId: string, count: number, libraryId = NODE_LIB) => ({
    __typename: 'TreeDistinctValues',
    count,
    value: {
        id: `node-${nodeRecordId}`,
        record: {
            id: nodeRecordId,
            whoAmI: {id: nodeRecordId, label: nodeRecordId, color: null, library: {id: libraryId}},
        },
    },
});

const noValueGroup = (count: number) => ({__typename: 'TreeDistinctValues', count, value: null});

const record = (id: string) => ({
    __typename: 'Record',
    id,
    whoAmI: {
        __typename: 'RecordIdentity',
        id,
        label: id,
        subLabel: null,
        color: null,
        preview: null,
        library: {__typename: 'Library', id: LIBRARY},
    },
    active: true,
    permissions: {create_record: true, delete_record: true},
    properties: [],
});

const distinctValuesMock = ({
    filters = [] as RecordFilterInput[],
    groups,
    delay,
}: {
    filters?: RecordFilterInput[];
    groups: Array<ReturnType<typeof treeGroup> | ReturnType<typeof noValueGroup>>;
    delay?: number;
}): MockedResponse => ({
    request: {
        query: ListDistinctValuesDocument,
        variables: {library: LIBRARY, attribute: AXIS, recordFilters: filters},
    },
    ...(delay === undefined ? {} : {delay}),
    result: {data: {listDistinctValues: groups}},
});

const pageMock = ({
    groupFilter,
    viewFilters = [],
    offset = 0,
    sorts = [],
    searchQuery = '',
    records,
    delay,
}: {
    groupFilter: RecordFilterInput;
    viewFilters?: RecordFilterInput[];
    offset?: number;
    sorts?: Array<{field: string; order: SortOrder}>;
    searchQuery?: string;
    records: Array<ReturnType<typeof record>>;
    delay?: number;
}): MockedResponse => ({
    request: {
        query: ExplorerLibraryDataDocument,
        variables: {
            libraryId: LIBRARY,
            attributeIds: ATTRIBUTE_IDS,
            pagination: {limit: KANBAN_COLUMN_PAGE_SIZE, offset},
            searchQuery,
            multipleSort: sorts,
            filters: appendGroupFilter(viewFilters, groupFilter),
        },
    },
    ...(delay === undefined ? {} : {delay}),
    result: {data: {records: {totalCount: records.length, list: records}}},
});

const cardIds = (cards?: Array<{itemId: string}>) => (cards ?? []).map(card => card.itemId);

const recordUpdateMock = (recordId: string, delay = 50, updatedAttributes: string[] = []): MockedResponse => ({
    request: {
        query: RecordUpdateLightDocument,
        variables: {filters: {libraries: [LIBRARY]}},
    },
    delay,
    result: {
        data: {
            recordUpdate: {
                record: {id: recordId},
                updatedValues: updatedAttributes.map(attribute => ({attribute})),
            },
        },
    },
});

describe('useKanbanColumnsData', () => {
    describe('happy path: counts then one first page per column', () => {
        it('loads every column first page at offset 0 and keeps the no-value column only when its count is positive', async () => {
            const mocks = [
                distinctValuesMock({
                    groups: [treeGroup('draft', 2), treeGroup('validated', 1), noValueGroup(3)],
                }),
                pageMock({groupFilter: eqFilter('draft'), records: [record('d1'), record('d2')]}),
                pageMock({groupFilter: eqFilter('validated'), records: [record('v1')]}),
                pageMock({groupFilter: noValueFilter(), records: [record('n1'), record('n2'), record('n3')]}),
            ];

            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks,
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });

            await waitFor(() => expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['d1', 'd2']));

            const {columnStatesById} = result.current;
            expect(columnStatesById.draft.count).toBe(2);
            expect(cardIds(columnStatesById.validated.cards)).toEqual(['v1']);
            expect(columnStatesById.validated.count).toBe(1);
            expect(cardIds(columnStatesById[NO_AXIS_VALUE_COLUMN_ID].cards)).toEqual(['n1', 'n2', 'n3']);
            expect(columnStatesById[NO_AXIS_VALUE_COLUMN_ID].count).toBe(3);
        });

        it('omits the no-value column entirely when its count is zero', async () => {
            const mocks = [
                distinctValuesMock({groups: [treeGroup('draft', 1)]}),
                pageMock({groupFilter: eqFilter('draft'), records: [record('d1')]}),
            ];

            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks,
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });

            await waitFor(() => expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['d1']));
            expect(result.current.columnStatesById[NO_AXIS_VALUE_COLUMN_ID]).toBeUndefined();
        });
    });

    describe('loadMore paginates at offset = cards.length', () => {
        it('appends the next page loaded at the cumulated offset', async () => {
            const firstPage = Array.from({length: KANBAN_COLUMN_PAGE_SIZE}, (_, i) => record(`c${i}`));
            const mocks = [
                distinctValuesMock({groups: [treeGroup('draft', 12)]}),
                pageMock({groupFilter: eqFilter('draft'), offset: 0, records: firstPage}),
                pageMock({
                    groupFilter: eqFilter('draft'),
                    offset: KANBAN_COLUMN_PAGE_SIZE,
                    records: [record('c10'), record('c11')],
                }),
            ];

            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks,
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });

            await waitFor(() =>
                expect(result.current.columnStatesById.draft?.cards).toHaveLength(KANBAN_COLUMN_PAGE_SIZE),
            );

            act(() => {
                result.current.loadMore('draft');
            });

            await waitFor(() => expect(result.current.columnStatesById.draft.cards).toHaveLength(12));
            expect(cardIds(result.current.columnStatesById.draft.cards).slice(-2)).toEqual(['c10', 'c11']);
        });
    });

    describe('a second loadMore while already loading is a no-op', () => {
        it('does not fire a second request when the column is still loading', async () => {
            const firstPage = Array.from({length: KANBAN_COLUMN_PAGE_SIZE}, (_, i) => record(`c${i}`));
            const mocks = [
                distinctValuesMock({groups: [treeGroup('draft', 12)]}),
                pageMock({groupFilter: eqFilter('draft'), offset: 0, records: firstPage}),
                // Slow real "Voir plus" page.
                pageMock({
                    groupFilter: eqFilter('draft'),
                    offset: KANBAN_COLUMN_PAGE_SIZE,
                    records: [record('c10'), record('c11')],
                    delay: 100,
                }),
                // Trap: only consumed if the guard fails and a second request fires. Its record must never
                // appear in the column.
                pageMock({
                    groupFilter: eqFilter('draft'),
                    offset: KANBAN_COLUMN_PAGE_SIZE,
                    records: [record('leaked')],
                }),
            ];

            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks,
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });

            await waitFor(() =>
                expect(result.current.columnStatesById.draft?.cards).toHaveLength(KANBAN_COLUMN_PAGE_SIZE),
            );

            act(() => {
                result.current.loadMore('draft');
            });
            await waitFor(() => expect(result.current.columnStatesById.draft.isLoadingMore).toBe(true));

            // Second click while still loading — guarded out.
            act(() => {
                result.current.loadMore('draft');
            });

            await waitFor(() => expect(result.current.columnStatesById.draft.cards).toHaveLength(12));
            expect(cardIds(result.current.columnStatesById.draft.cards)).not.toContain('leaked');
        });
    });

    describe('a short page exhausts the column even though the count claims more', () => {
        it('stops loading and turns loadMore into a no-op once the server came back short', async () => {
            // GIVEN a column whose count announces 12 records but whose first page comes back short (7):
            // listDistinctValues ignores the fulltext search (V1), while the card pages honour it
            const shortPage = Array.from({length: 7}, (_, i) => record(`c${i}`));
            const mocks = [
                distinctValuesMock({groups: [treeGroup('draft', 12)]}),
                pageMock({groupFilter: eqFilter('draft'), offset: 0, records: shortPage}),
                // Trap: only consumed if a request still fires at the next offset despite the exhaustion.
                // Its record must never appear in the column.
                pageMock({groupFilter: eqFilter('draft'), offset: 7, records: [record('leaked')]}),
            ];

            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks,
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });

            // the short page settles the column as exhausted, with fewer cards than the count
            await waitFor(() => {
                expect(cardIds(result.current.columnStatesById.draft?.cards)).toHaveLength(7);
                expect(result.current.columnStatesById.draft?.isExhausted).toBe(true);
                expect(result.current.columnStatesById.draft?.isLoadingMore).toBe(false);
            });

            // WHEN a further load is requested anyway ("Voir plus" is hidden, this covers the belt)
            act(() => {
                result.current.loadMore('draft');
            });

            // THEN nothing fires: the column keeps its short set and never picks up the trap record
            await waitFor(() => expect(result.current.columnStatesById.draft.isLoadingMore).toBe(false));
            expect(cardIds(result.current.columnStatesById.draft.cards)).not.toContain('leaked');
        });
    });

    describe('stale-response guard by request signature', () => {
        it('discards a page response that resolves after the view (filters) changed', async () => {
            const filterB: RecordFilterInput = {field: 'name', condition: RecordFilterCondition.EQUAL, value: 'x'};
            const mocks = [
                // View A: its page is slow and will resolve after we switch to view B.
                distinctValuesMock({groups: [treeGroup('draft', 1)]}),
                pageMock({groupFilter: eqFilter('draft'), records: [record('A_old')], delay: 400}),
                // View B: fresh counts + a fast page.
                distinctValuesMock({filters: [filterB], groups: [treeGroup('draft', 1)]}),
                pageMock({groupFilter: eqFilter('draft'), viewFilters: [filterB], records: [record('B_new')]}),
            ];

            const {result, rerender} = renderHook(props => useKanbanColumnsData(props), {
                mocks,
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });

            // View A's page is in flight (started, not yet resolved).
            await waitFor(() => expect(result.current.columnStatesById.draft?.isLoadingMore).toBe(true));

            rerender({dataSource: {...baseDataSource, filters: [filterB]}, axisAttributeId: AXIS});

            await waitFor(() => expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['B_new']));

            // Let view A's slow page resolve; its stale response must be dropped, not appended.
            await new Promise(resolve => setTimeout(resolve, 500));
            expect(cardIds(result.current.columnStatesById.draft.cards)).toEqual(['B_new']);
        });
    });

    describe('reset + reload on a view change that does not touch the counts variables', () => {
        it('reloads the first pages after a sort-only change even though listDistinctValues does not re-fire', async () => {
            const sortedBy = [{field: 'label', order: SortOrder.asc}];
            const mocks = [
                // Counts are queried once: a sort change does not alter its variables.
                distinctValuesMock({groups: [treeGroup('draft', 1)]}),
                pageMock({groupFilter: eqFilter('draft'), sorts: [], records: [record('A1')]}),
                pageMock({groupFilter: eqFilter('draft'), sorts: sortedBy, records: [record('A2')]}),
            ];

            const {result, rerender} = renderHook(props => useKanbanColumnsData(props), {
                mocks,
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });

            await waitFor(() => expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['A1']));

            rerender({dataSource: {...baseDataSource, sorts: sortedBy}, axisAttributeId: AXIS});

            // Without requestSignature in the reload effect deps, the board would reset to empty and never
            // reload (countsData ref is unchanged), so this would hang on [].
            await waitFor(() => expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['A2']));
        });
    });

    describe('isReloading flags the reset → fresh-counts window of a view change', () => {
        it('is true while the new counts are in flight and false again once they land', async () => {
            // GIVEN a loaded board (view A), so the initial load is over
            const filterB: RecordFilterInput = {field: 'name', condition: RecordFilterCondition.EQUAL, value: 'x'};
            const mocks = [
                distinctValuesMock({groups: [treeGroup('draft', 1)]}),
                pageMock({groupFilter: eqFilter('draft'), records: [record('A1')]}),
                // View B's counts are slow so the reload window is observable.
                distinctValuesMock({filters: [filterB], groups: [treeGroup('draft', 1)], delay: 200}),
                pageMock({groupFilter: eqFilter('draft'), viewFilters: [filterB], records: [record('B1')]}),
            ];

            const {result, rerender} = renderHook(props => useKanbanColumnsData(props), {
                mocks,
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });
            await waitFor(() => {
                expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['A1']);
                expect(result.current.isReloading).toBe(false);
            });

            // WHEN the view changes (a filter is added): the board resets synchronously
            rerender({dataSource: {...baseDataSource, filters: [filterB]}, axisAttributeId: AXIS});

            // THEN the whole reload window is flagged — consumers freeze their derived values on it —
            // and it closes once the fresh counts land
            expect(result.current.isReloading).toBe(true);
            await waitFor(() => {
                expect(result.current.isReloading).toBe(false);
                expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['B1']);
            });
        });
    });

    describe('cards are de-duplicated by itemId across pages', () => {
        it('does not append a record already loaded in a previous page', async () => {
            const firstPage = Array.from({length: KANBAN_COLUMN_PAGE_SIZE}, (_, i) => record(`c${i}`));
            const mocks = [
                distinctValuesMock({groups: [treeGroup('draft', 12)]}),
                pageMock({groupFilter: eqFilter('draft'), offset: 0, records: firstPage}),
                // Overlaps on c9 (already loaded) plus two fresh records.
                pageMock({
                    groupFilter: eqFilter('draft'),
                    offset: KANBAN_COLUMN_PAGE_SIZE,
                    records: [record('c9'), record('c10'), record('c11')],
                }),
            ];

            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks,
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });

            await waitFor(() =>
                expect(result.current.columnStatesById.draft?.cards).toHaveLength(KANBAN_COLUMN_PAGE_SIZE),
            );

            act(() => {
                result.current.loadMore('draft');
            });

            await waitFor(() => expect(result.current.columnStatesById.draft.cards).toHaveLength(12));
            const ids = cardIds(result.current.columnStatesById.draft.cards);
            expect(new Set(ids).size).toBe(12);
            expect(ids.filter(id => id === 'c9')).toHaveLength(1);
        });
    });

    describe('each column filter uses its own node library, read from the counts (not the tree query)', () => {
        it('builds a per-node equality filter with the library carried by that node', async () => {
            const mocks = [
                distinctValuesMock({
                    groups: [treeGroup('draft', 1, 'statuses'), treeGroup('archived', 1, 'other_statuses')],
                }),
                // Each mock only matches if the hook resolved the node's own library from the counts.
                pageMock({groupFilter: eqFilter('draft', 'statuses'), records: [record('d1')]}),
                pageMock({groupFilter: eqFilter('archived', 'other_statuses'), records: [record('a1')]}),
            ];

            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks,
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });

            await waitFor(() => expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['d1']));
            await waitFor(() => expect(cardIds(result.current.columnStatesById.archived?.cards)).toEqual(['a1']));
        });
    });

    describe('a recordUpdate subscription event triggers a full board reload', () => {
        it('reloads every column so a card moved to a new axis value lands in its new column', async () => {
            // GIVEN a board with one column already loaded
            const initialMocks = [
                distinctValuesMock({groups: [treeGroup('draft', 2)]}),
                pageMock({groupFilter: eqFilter('draft'), records: [record('d1'), record('d2')]}),
            ];

            // WHEN a recordUpdate subscription event fires, moving d1 from "draft" to "validated"
            // (MockedProvider needs every response upfront, so the trigger is declared here too)
            const recordUpdateMocks = [
                // Delayed comfortably past the initial fan-out so the pre-reload state (['d1','d2']) is
                // reliably observed before the subscription event resets and reloads the board.
                recordUpdateMock('d1', 300),
                // Post-edit truth returned once the board reloads.
                distinctValuesMock({groups: [treeGroup('draft', 1), treeGroup('validated', 1)]}),
                pageMock({groupFilter: eqFilter('draft'), records: [record('d2')]}),
                pageMock({groupFilter: eqFilter('validated'), records: [record('d1')]}),
            ];

            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks: [...initialMocks, ...recordUpdateMocks],
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });
            await waitFor(() => expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['d1', 'd2']));

            // THEN the board resets and reloads every column with the post-edit truth
            await waitFor(() => {
                expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['d2']);
                expect(cardIds(result.current.columnStatesById.validated?.cards)).toEqual(['d1']);
            });
        });
    });

    describe('a recordUpdate event on a column loaded past its first page', () => {
        it('reloads every page the column already had instead of collapsing back to page 1', async () => {
            // GIVEN a column loaded two pages deep (first page + one "Voir plus")
            const firstPage = Array.from({length: KANBAN_COLUMN_PAGE_SIZE}, (_, i) => record(`c${i}`));
            const initialMocks = [
                distinctValuesMock({groups: [treeGroup('draft', KANBAN_COLUMN_PAGE_SIZE + 2)]}),
                pageMock({groupFilter: eqFilter('draft'), offset: 0, records: firstPage}),
                pageMock({
                    groupFilter: eqFilter('draft'),
                    offset: KANBAN_COLUMN_PAGE_SIZE,
                    records: [record('c10'), record('c11')],
                }),
            ];

            // WHEN an unlisted record switches active (e.g. gets created), while nothing in "draft"
            // actually changed — a plain value edit on an unlisted record would be ignored (see the
            // creation-form test below), so the reload trigger here must be an active switch
            const recordUpdateMocks = [
                recordUpdateMock('untouched-record', 300, ['active']),
                distinctValuesMock({groups: [treeGroup('draft', KANBAN_COLUMN_PAGE_SIZE + 2)]}),
                pageMock({groupFilter: eqFilter('draft'), offset: 0, records: firstPage}),
                pageMock({
                    groupFilter: eqFilter('draft'),
                    offset: KANBAN_COLUMN_PAGE_SIZE,
                    records: [record('c10'), record('c11')],
                }),
            ];

            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks: [...initialMocks, ...recordUpdateMocks],
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });

            await waitFor(() =>
                expect(result.current.columnStatesById.draft?.cards).toHaveLength(KANBAN_COLUMN_PAGE_SIZE),
            );
            act(() => {
                result.current.loadMore('draft');
            });
            await waitFor(() =>
                expect(result.current.columnStatesById.draft?.cards).toHaveLength(KANBAN_COLUMN_PAGE_SIZE + 2),
            );

            // THEN the reload restores both pages, not just the first one
            await waitFor(() =>
                expect(result.current.columnStatesById.draft?.cards).toHaveLength(KANBAN_COLUMN_PAGE_SIZE + 2),
            );
            expect(cardIds(result.current.columnStatesById.draft?.cards).slice(-2)).toEqual(['c10', 'c11']);
        });
    });

    describe('a value save on an unlisted record that does not switch active', () => {
        it('is ignored, so a creation form drafting an inactive record above the board does not reset it on every field', async () => {
            // GIVEN a loaded board
            const initialMocks = [
                distinctValuesMock({groups: [treeGroup('draft', 2)]}),
                pageMock({groupFilter: eqFilter('draft'), records: [record('d1'), record('d2')]}),
            ];

            // WHEN a recordUpdate fires for a record no column has loaded, saving a plain value —
            // the typical echo of a creation form field blur (the draft record is inactive)
            // Trap: the post-reload truth, consumed only if the event wrongly triggers a full reload.
            const trapMocks = [
                recordUpdateMock('drafted-record-in-creation', 300, ['title']),
                distinctValuesMock({groups: [treeGroup('draft', 1)]}),
                pageMock({groupFilter: eqFilter('draft'), records: [record('d1')]}),
            ];

            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks: [...initialMocks, ...trapMocks],
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });
            await waitFor(() => expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['d1', 'd2']));

            // ...the event fires at 300ms
            await new Promise(resolve => setTimeout(resolve, 500));

            // THEN the board is left exactly as it was: no reset, no reload
            await waitFor(() => {
                expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['d1', 'd2']);
                expect(result.current.columnStatesById.draft.count).toBe(2);
            });
        });
    });

    describe("a recordUpdate echoing this client's own drag & drop write", () => {
        it('is swallowed so the board is not reset and reloaded (the move is already optimistic)', async () => {
            // GIVEN a loaded board, and d1 flagged as a write this client is performing (a drag)
            const initialMocks = [
                distinctValuesMock({groups: [treeGroup('draft', 2)]}),
                pageMock({groupFilter: eqFilter('draft'), records: [record('d1'), record('d2')]}),
            ];

            // Trap: the post-reload truth. Consumed only if the echo wrongly triggers a full reload,
            // which would move d1 into a "validated" column — it must never happen here.
            const trapMocks = [
                recordUpdateMock('d1', 300),
                distinctValuesMock({groups: [treeGroup('draft', 1), treeGroup('validated', 1)]}),
                pageMock({groupFilter: eqFilter('draft'), records: [record('d2')]}),
                pageMock({groupFilter: eqFilter('validated'), records: [record('d1')]}),
            ];

            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks: [...initialMocks, ...trapMocks],
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });
            await waitFor(() => expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['d1', 'd2']));

            act(() => {
                result.current.markSelfWrite('d1');
            });

            // WHEN the subscription echoes d1 (fires at 300ms, after the flag is set)
            await new Promise(resolve => setTimeout(resolve, 500));

            // THEN the board is left exactly as it was: no reset, no "validated" column appeared
            await waitFor(() => {
                expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['d1', 'd2']);
                expect(result.current.columnStatesById.validated).toBeUndefined();
            });
        });
    });

    describe('a self-write flag stops swallowing echoes once its window has elapsed', () => {
        it('reloads the board on a later update of the same record, instead of swallowing it forever', async () => {
            // GIVEN a loaded board
            const initialMocks = [
                distinctValuesMock({groups: [treeGroup('draft', 2)]}),
                pageMock({groupFilter: eqFilter('draft'), records: [record('d1'), record('d2')]}),
            ];

            // The post-edit truth, served when the (now external) update of d1 reloads the board.
            const externalUpdateMocks = [
                recordUpdateMock('d1', 300),
                distinctValuesMock({groups: [treeGroup('draft', 1), treeGroup('validated', 1)]}),
                pageMock({groupFilter: eqFilter('draft'), records: [record('d2')]}),
                pageMock({groupFilter: eqFilter('validated'), records: [record('d1')]}),
            ];

            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks: [...initialMocks, ...externalUpdateMocks],
                // Tiny window: d1's suppression closes long before its echo (300ms) arrives.
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS, selfWriteEchoWindowMs: 20},
            });
            await waitFor(() => expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['d1', 'd2']));

            // WHEN d1 is flagged as a self-write, but its 20ms window elapses before the echo fires
            act(() => {
                result.current.markSelfWrite('d1');
            });

            // THEN the update is treated as external: the board resets and reloads with the post-edit truth
            await waitFor(() => {
                expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['d2']);
                expect(cardIds(result.current.columnStatesById.validated?.cards)).toEqual(['d1']);
            });
        });
    });

    describe('reloadColumns refreshes the given columns in isolation', () => {
        it('re-fetches only the requested column from the server, leaving the others untouched', async () => {
            // GIVEN a board with draft and validated both loaded
            const initialMocks = [
                distinctValuesMock({groups: [treeGroup('draft', 1), treeGroup('validated', 1)]}),
                pageMock({groupFilter: eqFilter('draft'), records: [record('d1')]}),
                pageMock({groupFilter: eqFilter('validated'), records: [record('v1')]}),
            ];

            // The server now returns a different card for draft on reload; validated has no reload mock,
            // proving it is not re-fetched.
            const reloadMocks = [pageMock({groupFilter: eqFilter('draft'), records: [record('d2')]})];

            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks: [...initialMocks, ...reloadMocks],
                initialProps: {dataSource: baseDataSource, axisAttributeId: AXIS},
            });
            await waitFor(() => expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['d1']));

            // WHEN only the draft column is reloaded
            act(() => {
                result.current.reloadColumns(['draft']);
            });

            // THEN draft shows the server's fresh card while validated keeps its untouched card
            await waitFor(() => {
                expect(cardIds(result.current.columnStatesById.draft?.cards)).toEqual(['d2']);
                expect(cardIds(result.current.columnStatesById.validated?.cards)).toEqual(['v1']);
            });
        });
    });

    describe('disabled: no query fires without a data source or an axis', () => {
        it('fires nothing and stays idle when the data source is undefined', async () => {
            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks: [],
                initialProps: {dataSource: undefined, axisAttributeId: AXIS},
            });

            await waitFor(() => expect(result.current.isInitialLoading).toBe(false));
            expect(result.current.columnStatesById).toEqual({});
        });

        it('fires nothing and stays idle when the axis attribute id is undefined', async () => {
            const {result} = renderHook(props => useKanbanColumnsData(props), {
                mocks: [],
                initialProps: {dataSource: baseDataSource, axisAttributeId: undefined},
            });

            await waitFor(() => expect(result.current.isInitialLoading).toBe(false));
            expect(result.current.columnStatesById).toEqual({});
        });
    });
});
