import {ViewV2Types} from '../../../../../../__generated__';
import {currentViewReducer, initialCurrentViewState} from '../currentViewReducer';
import {type CurrentView} from '../_types';

type NonNullState = NonNullable<CurrentView>;

const makeAttributes = (
    defs: Array<{id: string; label: string; visible: boolean}>,
): NonNullState['display']['attributes'] =>
    defs.map(({id, label, visible}) => ({visible, attribute: {id, label: {en: label}}}));

const makeState = (overrides: Partial<NonNullState> = {}): NonNullState => ({
    id: 'view-1',
    label: {en: 'My view'},
    shared: false,
    display: {
        type: ViewV2Types.list,
        attributes: makeAttributes([
            {id: 'a', label: 'A', visible: true},
            {id: 'b', label: 'B', visible: true},
            {id: 'c', label: 'C', visible: false},
            {id: 'd', label: 'D', visible: false},
        ]),
    },
    ...overrides,
});

const attrIds = (state: NonNullState) => state.display.attributes.map(attr => attr.attribute.id);
const attrVisible = (state: NonNullState, id: string) =>
    state.display.attributes.find(attr => attr.attribute.id === id)?.visible;

describe('currentViewReducer', () => {
    describe('LOAD_VIEW', () => {
        it('replaces the whole state with the payload', () => {
            const payload = makeState({id: 'view-2'});
            expect(currentViewReducer(initialCurrentViewState, {type: 'LOAD_VIEW', payload})).toBe(payload);
        });
    });

    describe('SET_VIEW_TYPE', () => {
        it('updates only the view type and keeps the attributes reference', () => {
            const state = makeState();
            const next = currentViewReducer(state, {type: 'SET_VIEW_TYPE', payload: {viewType: ViewV2Types.cards}});
            expect(next!.display.type).toBe(ViewV2Types.cards);
            expect(next!.display.attributes).toBe(state.display.attributes);
        });
    });

    describe('TOGGLE_VISIBILITY', () => {
        it('hides a visible column in place (order unchanged)', () => {
            const next = currentViewReducer(makeState(), {type: 'TOGGLE_VISIBILITY', payload: {id: 'a'}});
            expect(attrVisible(next!, 'a')).toBe(false);
            expect(attrIds(next!)).toEqual(['a', 'b', 'c', 'd']);
        });

        it('shows a hidden column and appends it after the last visible column', () => {
            // Toggle 'd' (last column, sitting after the hidden 'c'): it must move up just after the
            // last visible column 'b', proving the repositioning — not merely the flag flip.
            const next = currentViewReducer(makeState(), {type: 'TOGGLE_VISIBILITY', payload: {id: 'd'}});
            expect(attrVisible(next!, 'd')).toBe(true);
            expect(next!.display.attributes.filter(attr => attr.visible).map(attr => attr.attribute.id)).toEqual([
                'a',
                'b',
                'd',
            ]);
            expect(attrIds(next!)).toEqual(['a', 'b', 'd', 'c']);
        });

        it('shows a hidden column at the front when no column is visible', () => {
            const state = makeState({
                display: {
                    type: ViewV2Types.list,
                    attributes: makeAttributes([
                        {id: 'a', label: 'A', visible: false},
                        {id: 'b', label: 'B', visible: false},
                    ]),
                },
            });
            const next = currentViewReducer(state, {type: 'TOGGLE_VISIBILITY', payload: {id: 'b'}});
            expect(attrIds(next!)).toEqual(['b', 'a']);
            expect(next!.display.attributes[0].visible).toBe(true);
        });
    });

    describe('MOVE_ATTRIBUTE', () => {
        it('reorders within the visible subset while keeping hidden columns in place', () => {
            const state = makeState({
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
            const next = currentViewReducer(state, {type: 'MOVE_ATTRIBUTE', payload: {activeId: 'a', overId: 'b'}});
            // Visible slots (positions 0 and 2) now hold b then a; hidden columns never moved.
            expect(attrIds(next!)).toEqual(['b', 'c', 'a', 'd']);
            expect(next!.display.attributes[1]).toEqual({visible: false, attribute: {id: 'c', label: {en: 'C'}}});
            expect(next!.display.attributes[3]).toEqual({visible: false, attribute: {id: 'd', label: {en: 'D'}}});
        });

        it('returns the same state when both ids are equal', () => {
            const state = makeState();
            expect(currentViewReducer(state, {type: 'MOVE_ATTRIBUTE', payload: {activeId: 'a', overId: 'a'}})).toBe(
                state,
            );
        });
    });
});
