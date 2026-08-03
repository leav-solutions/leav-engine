import {RecordFilterCondition, SortOrder, ViewV2Shortcut, ViewV2Types} from '../../../../../../__generated__';
import {currentViewReducer, initialCurrentViewState, viewReducer} from '../currentViewReducer';
import {IDENTITY_COLUMN_ID} from '../../tabs/tab-display/_constants';
import {type CurrentView} from '../_types';

type NonNullState = NonNullable<CurrentView>;

const makeAttributes = (
    defs: Array<{id: string; label: string; visible: boolean}>,
): NonNullState['display']['attributes'] =>
    defs.map(({id, label, visible}) => ({visible, attribute: {id, label: {en: label}}}));

const makeSorts = (ids: string[], activated = true): NonNullState['sorts'] =>
    ids.map(id => ({attributes: [{id, label: {en: id.toUpperCase()}}], order: SortOrder.asc, activated}));

// A sort whose path descends through several attributes (link-attribute descent). Its DnD id is the
// joined attribute ids (e.g. 'author/name'), per getSortId.
const makeCompositeSort = (attributePath: string[], activated = true): NonNullState['sorts'][number] => ({
    attributes: attributePath.map(id => ({id, label: {en: id.toUpperCase()}})),
    order: SortOrder.asc,
    activated,
});

const sortIds = (view: NonNullState) => view.sorts.map(sort => sort.attributes.map(attr => attr.id).join('/'));

const makeView = (overrides: Partial<NonNullState> = {}): NonNullState => ({
    id: 'view-1',
    library: 'my_lib',
    label: {en: 'My view'},
    shared: false,
    created_by: {id: '123', whoAmI: {id: '123', label: 'Me'}},
    display: {
        type: ViewV2Types.list,
        attributes: makeAttributes([
            {id: 'a', label: 'A', visible: true},
            {id: 'b', label: 'B', visible: true},
            {id: 'c', label: 'C', visible: false},
            {id: 'd', label: 'D', visible: false},
        ]),
    },
    sorts: [],
    filters: [],
    shortcuts: [ViewV2Shortcut.display],
    ...overrides,
});

const makeFilters = (ids: string[], pinned = true): NonNullState['filters'] =>
    ids.map(id => ({
        attributes: [{id, label: {en: id.toUpperCase()}}],
        condition: RecordFilterCondition.EQUAL,
        values: [],
        pinned,
    }));

const filterIds = (view: NonNullState) => view.filters.map(filter => filter.attributes.map(attr => attr.id).join('/'));

const attrIds = (view: NonNullState) => view.display.attributes.map(attr => attr.attribute.id);
const attrVisible = (view: NonNullState, id: string) =>
    view.display.attributes.find(attr => attr.attribute.id === id)?.visible;

// The pure, single-view reducer powering the display-only actions shared across tabs.
describe('viewReducer (display actions)', () => {
    describe('SET_VIEW_TYPE', () => {
        it('updates only the view type and keeps the attributes reference when there is no axis', () => {
            const view = makeView();
            const next = viewReducer(view, {type: 'SET_VIEW_TYPE', payload: {viewType: ViewV2Types.cards}});
            expect(next.display.type).toBe(ViewV2Types.cards);
            expect(next.display.attributes).toBe(view.display.attributes);
        });

        it('clears the grouping axis on a type switch (blank axis when re-entering kanban)', () => {
            const kanban = makeView({display: {type: ViewV2Types.kanban, attributes: makeView().display.attributes}});
            const withAxis = viewReducer(kanban, {
                type: 'SET_GROUP_BY_ATTRIBUTE',
                payload: {attribute: {id: 'b', label: {en: 'B'}}},
            });
            expect(withAxis.display.attributes.find(attr => attr.attribute.id === 'b')?.isGroupBy).toBe(true);

            const next = viewReducer(withAxis, {type: 'SET_VIEW_TYPE', payload: {viewType: ViewV2Types.list}});
            expect(next.display.type).toBe(ViewV2Types.list);
            expect(next.display.attributes.some(attr => attr.isGroupBy)).toBe(false);
        });

        it('preserves the view reference on a full no-op (same type, no axis)', () => {
            const view = makeView();
            const next = viewReducer(view, {type: 'SET_VIEW_TYPE', payload: {viewType: view.display.type}});
            expect(next).toBe(view);
        });
    });

    describe('SET_GROUP_BY_ATTRIBUTE', () => {
        const groupByOf = (view: NonNullState, id: string) =>
            view.display.attributes.find(attr => attr.attribute.id === id)?.isGroupBy;
        const columnOf = (view: NonNullState, id: string) =>
            view.display.attributes.find(attr => attr.attribute.id === id);
        const axis = (id: string) => ({id, label: {en: id.toUpperCase()}});

        it('flags an existing display attribute as the axis and leaves the others unflagged', () => {
            const view = makeView();
            const next = viewReducer(view, {type: 'SET_GROUP_BY_ATTRIBUTE', payload: {attribute: axis('b')}});

            expect(groupByOf(next, 'b')).toBe(true);
            // Attributes that were never the axis stay unflagged (no explicit `false` written, to avoid churn).
            expect(groupByOf(next, 'a')).toBeUndefined();
            expect(groupByOf(next, 'c')).toBeUndefined();
        });

        it('appends a not-yet-displayed attribute as a hidden column and flags it as the axis', () => {
            const view = makeView();
            const next = viewReducer(view, {type: 'SET_GROUP_BY_ATTRIBUTE', payload: {attribute: axis('status')}});

            const added = columnOf(next, 'status');
            expect(added).toEqual({visible: false, isGroupBy: true, attribute: axis('status')});
        });

        it('moves the axis to another attribute (single axis at a time)', () => {
            const withAxis = viewReducer(makeView(), {type: 'SET_GROUP_BY_ATTRIBUTE', payload: {attribute: axis('b')}});
            const next = viewReducer(withAxis, {type: 'SET_GROUP_BY_ATTRIBUTE', payload: {attribute: axis('c')}});

            expect(groupByOf(next, 'c')).toBe(true);
            // The former axis is explicitly unset (it carried `true`, so it is flipped to `false`).
            expect(groupByOf(next, 'b')).toBe(false);
        });

        it('clears the axis when attribute is null', () => {
            const withAxis = viewReducer(makeView(), {type: 'SET_GROUP_BY_ATTRIBUTE', payload: {attribute: axis('b')}});
            const next = viewReducer(withAxis, {type: 'SET_GROUP_BY_ATTRIBUTE', payload: {attribute: null}});

            expect(groupByOf(next, 'b')).toBe(false);
        });

        it('preserves the view reference when the axis is unchanged', () => {
            const withAxis = viewReducer(makeView(), {type: 'SET_GROUP_BY_ATTRIBUTE', payload: {attribute: axis('b')}});
            const next = viewReducer(withAxis, {type: 'SET_GROUP_BY_ATTRIBUTE', payload: {attribute: axis('b')}});

            expect(next).toBe(withAxis);
        });
    });

    describe('SET_DISPLAY_SETTINGS', () => {
        it('writes opaque display settings without touching type or attributes', () => {
            const view = makeView();
            const settings = {simple: {mode: 'timeline', showEvents: true}};
            const next = viewReducer(view, {type: 'SET_DISPLAY_SETTINGS', payload: {settings}});
            expect(next.display.settings).toEqual(settings);
            expect(next.display.type).toBe(view.display.type);
            expect(next.display.attributes).toBe(view.display.attributes);
        });

        it('returns the SAME view reference on an idempotent write (anti-loop guard)', () => {
            const settings = {simple: {mode: 'timeline'}};
            const view = makeView({display: {type: ViewV2Types.list, attributes: [], settings}});
            const next = viewReducer(view, {
                type: 'SET_DISPLAY_SETTINGS',
                payload: {settings: {simple: {mode: 'timeline'}}},
            });
            expect(next).toBe(view);
        });
    });

    describe('TOGGLE_VISIBILITY', () => {
        it('hides a visible column in place (order unchanged)', () => {
            const next = viewReducer(makeView(), {type: 'TOGGLE_VISIBILITY', payload: {id: 'a'}});
            expect(attrVisible(next, 'a')).toBe(false);
            expect(attrIds(next)).toEqual(['a', 'b', 'c', 'd']);
        });

        it('shows a hidden column and appends it after the last visible column', () => {
            // Toggle 'd' (last column, sitting after the hidden 'c'): it must move up just after the
            // last visible column 'b', proving the repositioning — not merely the flag flip.
            const next = viewReducer(makeView(), {type: 'TOGGLE_VISIBILITY', payload: {id: 'd'}});
            expect(attrVisible(next, 'd')).toBe(true);
            expect(next.display.attributes.filter(attr => attr.visible).map(attr => attr.attribute.id)).toEqual([
                'a',
                'b',
                'd',
            ]);
            expect(attrIds(next)).toEqual(['a', 'b', 'd', 'c']);
        });

        it('shows a hidden column at the front when no column is visible', () => {
            const view = makeView({
                display: {
                    type: ViewV2Types.list,
                    attributes: makeAttributes([
                        {id: 'a', label: 'A', visible: false},
                        {id: 'b', label: 'B', visible: false},
                    ]),
                },
            });
            const next = viewReducer(view, {type: 'TOGGLE_VISIBILITY', payload: {id: 'b'}});
            expect(attrIds(next)).toEqual(['b', 'a']);
            expect(next.display.attributes[0].visible).toBe(true);
        });
    });

    describe('MOVE_ATTRIBUTE', () => {
        it('reorders within the visible subset while keeping hidden columns in place', () => {
            const view = makeView({
                display: {
                    type: ViewV2Types.list,
                    attributes: makeAttributes([
                        {id: 'a', label: 'A', visible: true},
                        {id: 'c', label: 'C', visible: false}, // hidden, sitting between two visible ones
                        {id: 'b', label: 'B', visible: true},
                        {id: 'd', label: 'D', visible: false},
                    ]),
                },
            });
            const next = viewReducer(view, {type: 'MOVE_ATTRIBUTE', payload: {activeId: 'a', overId: 'b'}});
            // Visible slots (positions 0 and 2) now hold b then a; hidden columns never moved.
            expect(attrIds(next)).toEqual(['b', 'c', 'a', 'd']);
            expect(next.display.attributes[1]).toEqual({visible: false, attribute: {id: 'c', label: {en: 'C'}}});
            expect(next.display.attributes[3]).toEqual({visible: false, attribute: {id: 'd', label: {en: 'D'}}});
        });

        it('returns the same view when both ids are equal', () => {
            const view = makeView();
            expect(viewReducer(view, {type: 'MOVE_ATTRIBUTE', payload: {activeId: 'a', overId: 'a'}})).toBe(view);
        });
    });

    describe('MOVE_SORT', () => {
        it('reorders the sorts array (array order = order in which sorts are applied)', () => {
            const view = makeView({sorts: makeSorts(['a', 'b', 'c'])});
            const next = viewReducer(view, {type: 'MOVE_SORT', payload: {activeId: 'a', overId: 'c'}});
            expect(sortIds(next)).toEqual(['b', 'c', 'a']);
        });

        it('identifies sorts by their composite attribute path (link-attribute descent)', () => {
            const view = makeView({
                sorts: [makeCompositeSort(['author', 'name']), makeSorts(['date'])[0]],
            });
            const next = viewReducer(view, {
                type: 'MOVE_SORT',
                payload: {activeId: 'author/name', overId: 'date'},
            });
            expect(sortIds(next)).toEqual(['date', 'author/name']);
        });
    });

    describe('SET_SORT_ORDER', () => {
        it('updates the order of the targeted sort and keeps the others untouched', () => {
            const view = makeView({sorts: makeSorts(['a', 'b'])});
            const next = viewReducer(view, {type: 'SET_SORT_ORDER', payload: {id: 'a', order: SortOrder.desc}});
            expect(next.sorts[0].order).toBe(SortOrder.desc);
            expect(next.sorts[1].order).toBe(SortOrder.asc);
        });

        it('targets a sort identified by its composite attribute path', () => {
            const view = makeView({
                sorts: [makeSorts(['date'])[0], makeCompositeSort(['author', 'name'])],
            });
            const next = viewReducer(view, {
                type: 'SET_SORT_ORDER',
                payload: {id: 'author/name', order: SortOrder.desc},
            });
            expect(next.sorts[1].order).toBe(SortOrder.desc);
            expect(next.sorts[0].order).toBe(SortOrder.asc);
        });
    });

    describe('TOGGLE_SORT_ACTIVATED', () => {
        const activatedOf = (view: NonNullState, id: string) =>
            view.sorts.find(sort => sort.attributes.map(attr => attr.id).join('/') === id)?.activated;

        it('deactivates an activated sort in place (order unchanged)', () => {
            const view = makeView({sorts: makeSorts(['a', 'b', 'c'])});
            const next = viewReducer(view, {type: 'TOGGLE_SORT_ACTIVATED', payload: {id: 'a'}});
            expect(activatedOf(next, 'a')).toBe(false);
            expect(sortIds(next)).toEqual(['a', 'b', 'c']);
        });

        it('activates a deactivated sort and appends it after the last activated sort', () => {
            // a(activated), b(activated), c(deactivated), d(deactivated). Activating 'd' must move it
            // just after the last activated sort 'b', proving the repositioning — not merely the flag flip.
            const view = makeView({sorts: [...makeSorts(['a', 'b']), ...makeSorts(['c', 'd'], false)]});
            const next = viewReducer(view, {type: 'TOGGLE_SORT_ACTIVATED', payload: {id: 'd'}});
            expect(activatedOf(next, 'd')).toBe(true);
            expect(next.sorts.filter(sort => sort.activated).map(sort => sort.attributes[0].id)).toEqual([
                'a',
                'b',
                'd',
            ]);
            expect(sortIds(next)).toEqual(['a', 'b', 'd', 'c']);
        });

        it('activates a deactivated sort at the front when none is activated', () => {
            const view = makeView({sorts: makeSorts(['a', 'b'], false)});
            const next = viewReducer(view, {type: 'TOGGLE_SORT_ACTIVATED', payload: {id: 'b'}});
            expect(sortIds(next)).toEqual(['b', 'a']);
            expect(next.sorts[0].activated).toBe(true);
        });

        it('targets a sort identified by its composite attribute path', () => {
            const view = makeView({sorts: [makeCompositeSort(['author', 'name'], false)]});
            const next = viewReducer(view, {type: 'TOGGLE_SORT_ACTIVATED', payload: {id: 'author/name'}});
            expect(activatedOf(next, 'author/name')).toBe(true);
        });
    });

    describe('TOGGLE_SHORTCUT', () => {
        it('pins a shortcut that is not pinned yet', () => {
            const view = makeView({shortcuts: [ViewV2Shortcut.display]});
            const next = viewReducer(view, {type: 'TOGGLE_SHORTCUT', payload: {shortcut: ViewV2Shortcut.filters}});
            expect(next.shortcuts).toEqual([ViewV2Shortcut.display, ViewV2Shortcut.filters]);
        });

        it('unpins a shortcut that is already pinned', () => {
            const view = makeView({shortcuts: [ViewV2Shortcut.display, ViewV2Shortcut.sorts]});
            const next = viewReducer(view, {type: 'TOGGLE_SHORTCUT', payload: {shortcut: ViewV2Shortcut.sorts}});
            expect(next.shortcuts).toEqual([ViewV2Shortcut.display]);
        });

        it('never toggles the always-pinned display shortcut off', () => {
            const view = makeView({shortcuts: [ViewV2Shortcut.display]});
            const next = viewReducer(view, {type: 'TOGGLE_SHORTCUT', payload: {shortcut: ViewV2Shortcut.display}});
            expect(next.shortcuts).toEqual([ViewV2Shortcut.display]);
        });
    });

    describe('SET_AVAILABLE_COLUMNS', () => {
        it('keeps still-selected columns (order + visibility), appends new ones hidden, drops the rest', () => {
            // makeView: a(visible), b(visible), c(hidden), d(hidden)
            const next = viewReducer(makeView(), {
                type: 'SET_AVAILABLE_COLUMNS',
                payload: {
                    attributes: [
                        {id: 'b', label: {en: 'B'}},
                        {id: 'a', label: {en: 'A'}},
                        {id: 'e', label: {en: 'E'}},
                    ],
                },
            });

            // c and d deselected → dropped; a and b keep their existing view order + visibility;
            // e is new → appended hidden. Payload order does not reorder kept columns.
            expect(attrIds(next)).toEqual(['a', 'b', 'e']);
            expect(attrVisible(next, 'a')).toBe(true);
            expect(attrVisible(next, 'b')).toBe(true);
            expect(attrVisible(next, 'e')).toBe(false);
        });

        it('never drops the hard-coded identity column, even when absent from the gear selection', () => {
            const view = makeView({
                display: {
                    type: ViewV2Types.list,
                    attributes: makeAttributes([
                        {id: IDENTITY_COLUMN_ID, label: 'Identity', visible: true},
                        {id: 'a', label: 'A', visible: true},
                    ]),
                },
            });
            const next = viewReducer(view, {
                type: 'SET_AVAILABLE_COLUMNS',
                payload: {attributes: [{id: 'a', label: {en: 'A'}}]},
            });

            expect(attrIds(next)).toContain(IDENTITY_COLUMN_ID);
        });
    });

    describe('SET_AVAILABLE_SORTS', () => {
        it('keeps still-selected sorts (priority order + asc/desc), appends new ones ascending, drops the rest', () => {
            const view = makeView({
                sorts: [
                    {attributes: [{id: 'date', label: {en: 'DATE'}}], order: SortOrder.desc, activated: true},
                    makeCompositeSort(['author', 'name']),
                ],
            });

            const next = viewReducer(view, {
                type: 'SET_AVAILABLE_SORTS',
                payload: {
                    sorts: [
                        {
                            attributes: [
                                {id: 'author', label: {en: 'AUTHOR'}},
                                {id: 'name', label: {en: 'NAME'}},
                            ],
                        },
                        {attributes: [{id: 'price', label: {en: 'PRICE'}}]},
                    ],
                },
            });

            // 'date' deselected → dropped; 'author/name' kept (and keeps its ascending order);
            // 'price' is new → appended ascending and deactivated by default.
            expect(sortIds(next)).toEqual(['author/name', 'price']);
            expect(next.sorts[1].order).toBe(SortOrder.asc);
            expect(next.sorts[1].activated).toBe(false);
        });

        it('preserves the asc/desc order of a kept sort', () => {
            const view = makeView({
                sorts: [{attributes: [{id: 'date', label: {en: 'DATE'}}], order: SortOrder.desc, activated: true}],
            });
            const next = viewReducer(view, {
                type: 'SET_AVAILABLE_SORTS',
                payload: {sorts: [{attributes: [{id: 'date', label: {en: 'DATE'}}]}]},
            });

            expect(next.sorts[0].order).toBe(SortOrder.desc);
        });
    });

    describe('MOVE_FILTER', () => {
        it('reorders filters by their attribute-path id', () => {
            const view = makeView({filters: makeFilters(['a', 'b', 'c'])});
            const next = viewReducer(view, {type: 'MOVE_FILTER', payload: {activeId: 'a', overId: 'c'}});
            expect(filterIds(next)).toEqual(['b', 'c', 'a']);
        });

        it('is a no-op when active equals over', () => {
            const view = makeView({filters: makeFilters(['a', 'b'])});
            const next = viewReducer(view, {type: 'MOVE_FILTER', payload: {activeId: 'a', overId: 'a'}});
            expect(next).toBe(view);
        });
    });

    describe('TOGGLE_FILTER_PINNED', () => {
        const pinnedOf = (view: NonNullState, id: string) =>
            view.filters.find(filter => filter.attributes.map(attr => attr.id).join('/') === id)?.pinned;

        it('unpins a pinned filter in place (order unchanged)', () => {
            const view = makeView({filters: makeFilters(['a', 'b', 'c'])});
            const next = viewReducer(view, {type: 'TOGGLE_FILTER_PINNED', payload: {id: 'a'}});
            expect(pinnedOf(next, 'a')).toBe(false);
            expect(filterIds(next)).toEqual(['a', 'b', 'c']);
        });

        it('pins an unpinned filter and appends it after the last pinned filter', () => {
            const view = makeView({filters: [...makeFilters(['a', 'b']), ...makeFilters(['c', 'd'], false)]});
            const next = viewReducer(view, {type: 'TOGGLE_FILTER_PINNED', payload: {id: 'd'}});
            expect(pinnedOf(next, 'd')).toBe(true);
            expect(filterIds(next)).toEqual(['a', 'b', 'd', 'c']);
        });
    });

    describe('SET_FILTER_CONFIG', () => {
        it('updates the condition and values of the targeted filter in place', () => {
            const view = makeView({filters: makeFilters(['status', 'city'])});
            const next = viewReducer(view, {
                type: 'SET_FILTER_CONFIG',
                payload: {id: 'city', condition: RecordFilterCondition.CONTAINS, values: ['paris']},
            });

            expect(next.filters[1].condition).toBe(RecordFilterCondition.CONTAINS);
            expect(next.filters[1].values).toEqual(['paris']);
            // Untargeted filter is untouched.
            expect(next.filters[0].condition).toBe(RecordFilterCondition.EQUAL);
        });

        it('is a no-op when the id is unknown', () => {
            const view = makeView({filters: makeFilters(['status'])});
            const next = viewReducer(view, {
                type: 'SET_FILTER_CONFIG',
                payload: {id: 'nope', condition: RecordFilterCondition.EQUAL, values: []},
            });
            expect(next).toBe(view);
        });

        // G1 hardening: an idempotent write (same condition + values) must return the SAME view ref so the
        // wrapper's useReducer bail-out holds and the hub↔spoke value sync can't loop. Mirror of SET_SORT_ORDER.
        it('returns the same view reference when condition and values are unchanged', () => {
            const view = makeView({
                filters: [
                    {
                        attributes: [{id: 'status', label: {en: 'STATUS'}}],
                        condition: RecordFilterCondition.CONTAINS,
                        values: ['paris'],
                        pinned: true,
                    },
                ],
            });
            const next = viewReducer(view, {
                type: 'SET_FILTER_CONFIG',
                payload: {id: 'status', condition: RecordFilterCondition.CONTAINS, values: ['paris']},
            });
            expect(next).toBe(view);
        });

        it('persists withEmptyValues on the targeted filter', () => {
            const view = makeView({filters: makeFilters(['status'])});
            const next = viewReducer(view, {
                type: 'SET_FILTER_CONFIG',
                payload: {id: 'status', condition: RecordFilterCondition.EQUAL, values: [], withEmptyValues: true},
            });
            expect(next.filters[0].withEmptyValues).toBe(true);
        });

        // G1 also covers withEmptyValues: toggling it is a real change, so the view ref must NOT be preserved.
        it('returns a new view reference when only withEmptyValues changes', () => {
            const view = makeView({
                filters: [
                    {
                        attributes: [{id: 'status', label: {en: 'STATUS'}}],
                        condition: RecordFilterCondition.EQUAL,
                        values: [],
                        pinned: true,
                        withEmptyValues: false,
                    },
                ],
            });
            const next = viewReducer(view, {
                type: 'SET_FILTER_CONFIG',
                payload: {id: 'status', condition: RecordFilterCondition.EQUAL, values: [], withEmptyValues: true},
            });
            expect(next).not.toBe(view);
            expect(next.filters[0].withEmptyValues).toBe(true);
        });
    });

    describe('REPATH_FILTER', () => {
        it('re-paths a bare link to a through, preserving pinned and position', () => {
            const view = makeView({
                filters: [
                    {
                        attributes: [{id: 'status', label: {en: 'STATUS'}}],
                        condition: RecordFilterCondition.EQUAL,
                        values: [],
                        pinned: true,
                    },
                    {
                        attributes: [{id: 'link', label: {en: 'LINK'}}],
                        condition: RecordFilterCondition.EQUAL,
                        values: [],
                        pinned: true,
                    },
                ],
            });

            const next = viewReducer(view, {
                type: 'REPATH_FILTER',
                payload: {
                    oldId: 'link',
                    attributes: [{id: 'link'}, {id: 'subAttr'}],
                    condition: RecordFilterCondition.CONTAINS,
                    values: ['x'],
                },
            });

            // Position preserved (still index 1), id now the through path, pinned kept.
            expect(filterIds(next)).toEqual(['status', 'link/subAttr']);
            expect(next.filters[1].pinned).toBe(true);
            expect(next.filters[1].condition).toBe(RecordFilterCondition.CONTAINS);
            expect(next.filters[1].values).toEqual(['x']);
        });

        it('preserves the label of the base segment (reuses the existing attribute[0])', () => {
            const view = makeView({
                filters: [
                    {
                        attributes: [{id: 'link', label: {en: 'LINK'}}],
                        condition: RecordFilterCondition.EQUAL,
                        values: [],
                        pinned: true,
                    },
                ],
            });

            const next = viewReducer(view, {
                type: 'REPATH_FILTER',
                payload: {
                    oldId: 'link',
                    attributes: [{id: 'link'}, {id: 'subAttr'}],
                    condition: RecordFilterCondition.EQUAL,
                    values: [],
                },
            });

            // Base segment keeps its label from the existing filter; the descended segment carries just its id.
            expect(next.filters[0].attributes[0]).toEqual({id: 'link', label: {en: 'LINK'}});
            expect(next.filters[0].attributes[1]).toEqual({id: 'subAttr'});
        });

        it('is a no-op when the old id is unknown', () => {
            const view = makeView({filters: makeFilters(['status'])});
            const next = viewReducer(view, {
                type: 'REPATH_FILTER',
                payload: {
                    oldId: 'nope',
                    attributes: [{id: 'nope'}, {id: 'sub'}],
                    condition: RecordFilterCondition.EQUAL,
                    values: [],
                },
            });
            expect(next).toBe(view);
        });

        it('returns the same view reference when path and config are unchanged (idempotent)', () => {
            const view = makeView({
                filters: [
                    {
                        attributes: [
                            {id: 'link', label: {en: 'LINK'}},
                            {id: 'subAttr', label: {en: 'SUB'}},
                        ],
                        condition: RecordFilterCondition.CONTAINS,
                        values: ['x'],
                        pinned: true,
                    },
                ],
            });

            const next = viewReducer(view, {
                type: 'REPATH_FILTER',
                payload: {
                    oldId: 'link/subAttr',
                    attributes: [{id: 'link'}, {id: 'subAttr'}],
                    condition: RecordFilterCondition.CONTAINS,
                    values: ['x'],
                },
            });

            expect(next).toBe(view);
        });
    });

    describe('SET_AVAILABLE_FILTERS', () => {
        it('keeps still-selected filters (order, pinned, condition, values), appends new ones, drops the rest', () => {
            const view = makeView({
                filters: [
                    {
                        attributes: [{id: 'status', label: {en: 'STATUS'}}],
                        condition: RecordFilterCondition.CONTAINS,
                        values: ['x'],
                        pinned: true,
                    },
                    ...makeFilters(['city'], false),
                ],
            });

            const next = viewReducer(view, {
                type: 'SET_AVAILABLE_FILTERS',
                payload: {
                    filters: [
                        {attributes: [{id: 'status', label: {en: 'STATUS'}}]},
                        {attributes: [{id: 'price', label: {en: 'PRICE'}}]},
                    ],
                },
            });

            // 'city' deselected → dropped; 'status' kept (condition/values/pinned preserved); 'price' new.
            expect(filterIds(next)).toEqual(['status', 'price']);
            expect(next.filters[0].condition).toBe(RecordFilterCondition.CONTAINS);
            expect(next.filters[0].values).toEqual(['x']);
            expect(next.filters[0].pinned).toBe(true);
            // New filter defaults: EQUAL condition, no value, unpinned, withEmptyValues off.
            expect(next.filters[1].condition).toBe(RecordFilterCondition.EQUAL);
            expect(next.filters[1].values).toEqual([]);
            expect(next.filters[1].pinned).toBe(false);
            expect(next.filters[1].withEmptyValues).toBe(false);
        });
    });
});

// The top-level reducer tracking the {view, savedView} snapshots.
describe('currentViewReducer (state wrapper)', () => {
    describe('LOAD_VIEW', () => {
        it('seeds both view and savedView with the payload', () => {
            const payload = makeView({id: 'view-2'});
            const next = currentViewReducer(initialCurrentViewState, {type: 'LOAD_VIEW', payload});
            expect(next.view).toBe(payload);
            expect(next.savedView).toBe(payload);
        });
    });

    describe('INIT_DEFAULT_VIEW', () => {
        it('seeds both snapshots with an identical synthetic empty draft (starts pristine)', () => {
            const next = currentViewReducer(initialCurrentViewState, {
                type: 'INIT_DEFAULT_VIEW',
                payload: {library: 'my_lib', createdBy: {id: 'user-1', label: 'Me'}},
            });

            expect(next.view).not.toBeNull();
            expect(next.view!.library).toBe('my_lib');
            expect(next.view!.display.attributes).toEqual([]);
            expect(next.view!.sorts).toEqual([]);
            expect(next.view!.created_by.whoAmI.id).toBe('user-1');
            // Both snapshots reference the same draft → isDirty starts false.
            expect(next.savedView).toBe(next.view);
        });

        it('RESET_VIEW reverts edits back to the empty draft', () => {
            const seeded = currentViewReducer(initialCurrentViewState, {
                type: 'INIT_DEFAULT_VIEW',
                payload: {library: 'my_lib', createdBy: {id: 'user-1', label: 'Me'}},
            });
            const edited = currentViewReducer(seeded, {type: 'SET_VIEW_TYPE', payload: {viewType: ViewV2Types.cards}});
            expect(edited.view!.display.type).toBe(ViewV2Types.cards);

            const reset = currentViewReducer(edited, {type: 'RESET_VIEW'});
            expect(reset.view).toBe(seeded.savedView);
            expect(reset.view!.display.type).toBe(ViewV2Types.list);
        });
    });

    describe('SET_LABEL', () => {
        it('updates only the current language, preserves the others and the display, leaves savedView intact', () => {
            const view = makeView({label: {fr: 'Catalogue', en: 'Catalog'}});
            const savedView = makeView({label: {fr: 'Catalogue', en: 'Catalog'}});
            const next = currentViewReducer(
                {view, savedView},
                {type: 'SET_LABEL', payload: {lang: 'fr', value: 'Produits'}},
            );

            expect(next.view!.label).toEqual({fr: 'Produits', en: 'Catalog'});
            expect(next.view!.display).toBe(view.display);
            expect(next.savedView).toBe(savedView);
        });
    });

    describe('SET_SHARED', () => {
        it('writes shared symmetrically on view AND savedView (so it never reads as dirty)', () => {
            const next = currentViewReducer(
                {view: makeView({shared: false}), savedView: makeView({shared: false})},
                {type: 'SET_SHARED', payload: {shared: true}},
            );
            expect(next.view!.shared).toBe(true);
            expect(next.savedView!.shared).toBe(true);
        });
    });

    describe('RESET_VIEW', () => {
        it('reverts view to savedView', () => {
            const savedView = makeView({label: {en: 'Saved'}});
            const view = makeView({label: {en: 'Edited'}});
            const next = currentViewReducer({view, savedView}, {type: 'RESET_VIEW'});
            expect(next.view).toBe(savedView);
            expect(next.savedView).toBe(savedView);
        });
    });

    describe('MARK_SAVED', () => {
        it('promotes the current view as the saved snapshot', () => {
            const savedView = makeView({label: {en: 'Saved'}});
            const view = makeView({label: {en: 'Edited'}});
            const next = currentViewReducer({view, savedView}, {type: 'MARK_SAVED'});
            expect(next.savedView).toBe(view);
            expect(next.view).toBe(view);
        });
    });

    describe('display actions delegation', () => {
        it('delegates to viewReducer on view and leaves savedView untouched', () => {
            const savedView = makeView();
            const view = makeView();
            const next = currentViewReducer(
                {view, savedView},
                {type: 'SET_VIEW_TYPE', payload: {viewType: ViewV2Types.cards}},
            );
            expect(next.view!.display.type).toBe(ViewV2Types.cards);
            expect(next.savedView).toBe(savedView);
        });

        it('is a no-op when there is no view loaded', () => {
            const next = currentViewReducer(initialCurrentViewState, {type: 'TOGGLE_VISIBILITY', payload: {id: 'a'}});
            expect(next).toEqual(initialCurrentViewState);
        });

        it('preserves the SAME state reference when the delegated action is a no-op', () => {
            // A no-op delegated action (here SET_FILTER_CONFIG on an unknown id) must not produce a new
            // state object, otherwise React's useReducer cannot bail out of needless re-renders.
            const view = makeView({filters: makeFilters(['status'])});
            const state = {view, savedView: view};
            const next = currentViewReducer(state, {
                type: 'SET_FILTER_CONFIG',
                payload: {id: 'unknown', condition: RecordFilterCondition.EQUAL, values: []},
            });
            expect(next).toBe(state);
        });
    });
});
