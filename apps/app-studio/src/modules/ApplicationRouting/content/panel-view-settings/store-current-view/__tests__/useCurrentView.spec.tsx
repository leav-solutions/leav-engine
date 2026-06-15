import {type ReactNode} from 'react';
import {renderHook} from '@testing-library/react';
import {ViewV2Types} from '../../../../../../__generated__';
import {CurrentViewContext} from '../CurrentViewContext';
import {type CurrentView} from '../_types';
import {useCurrentView} from '../useCurrentView';

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
    ...overrides,
});

const renderUseCurrentView = (value: {view: CurrentView; savedView: CurrentView; dispatch: jest.Mock}) => {
    const wrapper = ({children}: {children: ReactNode}) => (
        <CurrentViewContext.Provider value={value}>{children}</CurrentViewContext.Provider>
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

        it('ignores the shared flag (sharing is persisted out-of-band)', () => {
            const {result} = renderUseCurrentView({
                view: makeView({shared: true}),
                savedView: makeView({shared: false}),
                dispatch: jest.fn(),
            });
            expect(result.current.isDirty).toBe(false);
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
        });
    });
});
