import {SortOrder, ViewV2Shortcut, ViewV2Types} from '../../../../../../__generated__';
import {currentViewReducer, initialCurrentViewState, viewReducer} from '../currentViewReducer';
import {type CurrentView} from '../_types';

type NonNullState = NonNullable<CurrentView>;

const makeAttributes = (
    defs: Array<{id: string; label: string; visible: boolean}>,
): NonNullState['display']['attributes'] =>
    defs.map(({id, label, visible}) => ({visible, attribute: {id, label: {en: label}}}));

const makeSorts = (ids: string[]): NonNullState['sorts'] =>
    ids.map(id => ({attributes: [{id, label: {en: id.toUpperCase()}}], order: SortOrder.asc}));

// A sort whose path descends through several attributes (link-attribute descent). Its DnD id is the
// joined attribute ids (e.g. 'author/name'), per getSortId.
const makeCompositeSort = (attributePath: string[]): NonNullState['sorts'][number] => ({
    attributes: attributePath.map(id => ({id, label: {en: id.toUpperCase()}})),
    order: SortOrder.asc,
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
    shortcuts: [ViewV2Shortcut.display],
    ...overrides,
});

const attrIds = (view: NonNullState) => view.display.attributes.map(attr => attr.attribute.id);
const attrVisible = (view: NonNullState, id: string) =>
    view.display.attributes.find(attr => attr.attribute.id === id)?.visible;

// The pure, single-view reducer powering the display-only actions shared across tabs.
describe('viewReducer (display actions)', () => {
    describe('SET_VIEW_TYPE', () => {
        it('updates only the view type and keeps the attributes reference', () => {
            const view = makeView();
            const next = viewReducer(view, {type: 'SET_VIEW_TYPE', payload: {viewType: ViewV2Types.cards}});
            expect(next.display.type).toBe(ViewV2Types.cards);
            expect(next.display.attributes).toBe(view.display.attributes);
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
    });
});
