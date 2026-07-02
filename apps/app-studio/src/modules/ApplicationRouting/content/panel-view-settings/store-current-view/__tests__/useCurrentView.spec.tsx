import {type ReactNode} from 'react';
import {renderHook} from '@testing-library/react';
import {SortOrder, ViewV2Shortcut, ViewV2Types} from '../../../../../../__generated__';
import {CurrentViewContext} from '../CurrentViewContext';
import {type CurrentView} from '../_types';
import {useCurrentView} from '../useCurrentView';

type NonNullSort = NonNullable<CurrentView>['sorts'][number];

const makeSort = (attributePath: string[], order: SortOrder = SortOrder.asc, pinned = true): NonNullSort => ({
    attributes: attributePath.map(id => ({id, label: {en: id.toUpperCase()}})),
    order,
    pinned,
});

// Deterministic lang/user without spinning up the providers: the current user is '123'.
jest.mock('@leav/ui', () => ({
    useLang: () => ({lang: ['fr']}),
    useUser: () => ({userData: {userId: '123'}}),
}));

type NonNullView = NonNullable<CurrentView>;

const makeView = (overrides: Partial<NonNullView> = {}): NonNullView => ({
    id: 'view-1',
    library: 'lib',
    label: {fr: 'V'},
    shared: false,
    created_by: {id: '123', whoAmI: {id: '123', label: 'Moi'}},
    display: {type: ViewV2Types.list, attributes: []},
    sorts: [],
    filters: [],
    shortcuts: [ViewV2Shortcut.display],
    ...overrides,
});

const renderUseCurrentView = (value: {
    view: CurrentView;
    savedView: CurrentView;
    dispatch: jest.Mock;
    isEmptyView?: boolean;
    canManageViews?: boolean;
}) => {
    const wrapper = ({children}: {children: ReactNode}) => (
        <CurrentViewContext.Provider value={{isEmptyView: false, canManageViews: false, ...value}}>
            {children}
        </CurrentViewContext.Provider>
    );
    return renderHook(() => useCurrentView(), {wrapper});
};

describe('useCurrentView', () => {
    describe('isOwner', () => {
        it('is true when the view creator matches the current user', () => {
            const view = makeView();
            const {result} = renderUseCurrentView({view, savedView: view, dispatch: jest.fn()});
            expect(result.current.isOwner).toBe(true);
        });

        it('is false when the view was created by someone else', () => {
            const view = makeView({created_by: {id: '999', whoAmI: {id: '999', label: 'Alice'}}});
            const {result} = renderUseCurrentView({view, savedView: view, dispatch: jest.fn()});
            expect(result.current.isOwner).toBe(false);
        });
    });

    describe('canManageCurrentView', () => {
        const otherUser = {id: '999', whoAmI: {id: '999', label: 'Alice'}};

        it('is true for the owner regardless of the manage_views permission', () => {
            const view = makeView();
            const {result} = renderUseCurrentView({view, savedView: view, dispatch: jest.fn(), canManageViews: false});
            expect(result.current.canManageCurrentView).toBe(true);
        });

        it('is true for a non-owner with manage_views on a shared view', () => {
            const view = makeView({created_by: otherUser, shared: true});
            const {result} = renderUseCurrentView({view, savedView: view, dispatch: jest.fn(), canManageViews: true});
            expect(result.current.canManageCurrentView).toBe(true);
        });

        it('is false for a non-owner with manage_views on a private view', () => {
            const view = makeView({created_by: otherUser, shared: false});
            const {result} = renderUseCurrentView({view, savedView: view, dispatch: jest.fn(), canManageViews: true});
            expect(result.current.canManageCurrentView).toBe(false);
        });

        it('is false for a non-owner without manage_views on a shared view', () => {
            const view = makeView({created_by: otherUser, shared: true});
            const {result} = renderUseCurrentView({view, savedView: view, dispatch: jest.fn(), canManageViews: false});
            expect(result.current.canManageCurrentView).toBe(false);
        });
    });

    describe('isDirty', () => {
        it('is false when view and savedView share the same label/display', () => {
            const {result} = renderUseCurrentView({
                view: makeView(),
                savedView: makeView(),
                dispatch: jest.fn(),
            });
            expect(result.current.isDirty).toBe(false);
        });

        it('is true when the label diverged', () => {
            const {result} = renderUseCurrentView({
                view: makeView({label: {fr: 'Édité'}}),
                savedView: makeView({label: {fr: 'V'}}),
                dispatch: jest.fn(),
            });
            expect(result.current.isDirty).toBe(true);
        });

        it('is true when the sorts diverged', () => {
            const {result} = renderUseCurrentView({
                view: makeView({sorts: [makeSort(['date'], SortOrder.desc)]}),
                savedView: makeView({sorts: [makeSort(['date'], SortOrder.asc)]}),
                dispatch: jest.fn(),
            });
            expect(result.current.isDirty).toBe(true);
        });

        it('ignores the shared flag (sharing is persisted out-of-band)', () => {
            const {result} = renderUseCurrentView({
                view: makeView({shared: true}),
                savedView: makeView({shared: false}),
                dispatch: jest.fn(),
            });
            expect(result.current.isDirty).toBe(false);
        });

        it('is true when the shortcuts diverged', () => {
            const {result} = renderUseCurrentView({
                view: makeView({shortcuts: [ViewV2Shortcut.display, ViewV2Shortcut.filters]}),
                savedView: makeView({shortcuts: [ViewV2Shortcut.display]}),
                dispatch: jest.fn(),
            });
            expect(result.current.isDirty).toBe(true);
        });
    });

    describe('isEmptyView', () => {
        it('forwards the context flag', () => {
            const {result} = renderUseCurrentView({
                view: null,
                savedView: null,
                dispatch: jest.fn(),
                isEmptyView: true,
            });
            expect(result.current.isEmptyView).toBe(true);
        });

        it('defaults to false when a view is loaded', () => {
            const view = makeView();
            const {result} = renderUseCurrentView({view, savedView: view, dispatch: jest.fn()});
            expect(result.current.isEmptyView).toBe(false);
        });
    });

    describe('action creators', () => {
        it('dispatch the expected actions/payloads', () => {
            const dispatch = jest.fn();
            const view = makeView();
            const {result} = renderUseCurrentView({view, savedView: view, dispatch});

            result.current.setLabel('Nouveau');
            expect(dispatch).toHaveBeenCalledWith({type: 'SET_LABEL', payload: {lang: 'fr', value: 'Nouveau'}});

            result.current.setShared(true);
            expect(dispatch).toHaveBeenCalledWith({type: 'SET_SHARED', payload: {shared: true}});

            result.current.resetView();
            expect(dispatch).toHaveBeenCalledWith({type: 'RESET_VIEW'});

            result.current.markSaved();
            expect(dispatch).toHaveBeenCalledWith({type: 'MARK_SAVED'});

            result.current.setViewType(ViewV2Types.cards);
            expect(dispatch).toHaveBeenCalledWith({type: 'SET_VIEW_TYPE', payload: {viewType: ViewV2Types.cards}});

            result.current.toggleVisibility('attr-1');
            expect(dispatch).toHaveBeenCalledWith({type: 'TOGGLE_VISIBILITY', payload: {id: 'attr-1'}});

            result.current.moveAttribute('a', 'b');
            expect(dispatch).toHaveBeenCalledWith({type: 'MOVE_ATTRIBUTE', payload: {activeId: 'a', overId: 'b'}});

            result.current.moveSort('a', 'b');
            expect(dispatch).toHaveBeenCalledWith({type: 'MOVE_SORT', payload: {activeId: 'a', overId: 'b'}});

            result.current.setSortOrder('date', SortOrder.desc);
            expect(dispatch).toHaveBeenCalledWith({
                type: 'SET_SORT_ORDER',
                payload: {id: 'date', order: SortOrder.desc},
            });

            result.current.toggleSortPinned('date');
            expect(dispatch).toHaveBeenCalledWith({type: 'TOGGLE_SORT_PINNED', payload: {id: 'date'}});

            result.current.toggleShortcut(ViewV2Shortcut.filters);
            expect(dispatch).toHaveBeenCalledWith({
                type: 'TOGGLE_SHORTCUT',
                payload: {shortcut: ViewV2Shortcut.filters},
            });
        });
    });

    describe('sorts', () => {
        it('derives the dnd id, order, pinned flag, attribute ids and label of each sort', () => {
            const view = makeView({sorts: [makeSort(['author', 'name'], SortOrder.desc)]});
            const {result} = renderUseCurrentView({view, savedView: view, dispatch: jest.fn()});

            expect(result.current.sorts).toEqual([
                {
                    id: 'author/name',
                    order: SortOrder.desc,
                    pinned: true,
                    ids: ['author', 'name'],
                    label: 'AUTHOR › NAME',
                },
            ]);
        });

        it('splits pinned (view order) and unpinned (alphabetical) sorts', () => {
            const view = makeView({
                sorts: [
                    makeSort(['zeta'], SortOrder.asc, true),
                    makeSort(['alpha'], SortOrder.asc, true),
                    makeSort(['gamma'], SortOrder.asc, false),
                    makeSort(['beta'], SortOrder.asc, false),
                ],
            });
            const {result} = renderUseCurrentView({view, savedView: view, dispatch: jest.fn()});

            // Pinned keep the view-defined order (= sort priority).
            expect(result.current.pinnedSorts.map(sort => sort.id)).toEqual(['zeta', 'alpha']);
            // Unpinned are sorted alphabetically by label.
            expect(result.current.unpinnedSorts.map(sort => sort.id)).toEqual(['beta', 'gamma']);
        });
    });
});
