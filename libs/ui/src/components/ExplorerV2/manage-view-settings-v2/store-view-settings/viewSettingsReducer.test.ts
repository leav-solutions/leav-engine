import {
    type IViewSettingsAction,
    type IViewSettingsState,
    ViewSettingsActionTypes,
    viewSettingsReducer,
} from './viewSettingsReducer';
import {defaultPageSizeOptions, viewSettingsInitialState} from './viewSettingsInitialState';
import {MASS_SELECTION_ALL} from '../../_constants';

describe('ViewSettings Reducer (ExplorerV2)', () => {
    describe(`Action ${ViewSettingsActionTypes.CHANGE_PAGE_SIZE}`, () => {
        test('default value is the first of defaultPageSizeOptions', () => {
            expect(viewSettingsInitialState.pageSize).toEqual(defaultPageSizeOptions[0]);
        });

        test('updates pageSize only', () => {
            const state = viewSettingsReducer(viewSettingsInitialState, {
                type: ViewSettingsActionTypes.CHANGE_PAGE_SIZE,
                payload: {pageSize: 42},
            });
            expect(state).toEqual({...viewSettingsInitialState, pageSize: 42});
        });
    });

    describe(`Action ${ViewSettingsActionTypes.CHANGE_FULLTEXT_SEARCH}`, () => {
        test('updates fulltextSearch', () => {
            const state = viewSettingsReducer(viewSettingsInitialState, {
                type: ViewSettingsActionTypes.CHANGE_FULLTEXT_SEARCH,
                payload: {search: 'hello'},
            });
            expect(state.fulltextSearch).toEqual('hello');
        });
    });

    describe(`Action ${ViewSettingsActionTypes.CLEAR_FULLTEXT_SEARCH}`, () => {
        test('resets fulltextSearch to an empty string', () => {
            const state = viewSettingsReducer(
                {...viewSettingsInitialState, fulltextSearch: 'something'},
                {type: ViewSettingsActionTypes.CLEAR_FULLTEXT_SEARCH},
            );
            expect(state.fulltextSearch).toEqual('');
        });
    });

    describe(`Action ${ViewSettingsActionTypes.SET_SELECTED_KEYS}`, () => {
        test('updates massSelection with a list of keys', () => {
            const state = viewSettingsReducer(viewSettingsInitialState, {
                type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                payload: ['key1', 'key2'],
            });
            expect(state.massSelection).toEqual(['key1', 'key2']);
        });

        test('updates massSelection with the MASS_SELECTION_ALL sentinel', () => {
            const state = viewSettingsReducer(viewSettingsInitialState, {
                type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                payload: MASS_SELECTION_ALL,
            });
            expect(state.massSelection).toEqual(MASS_SELECTION_ALL);
        });
    });

    describe(`Action ${ViewSettingsActionTypes.CLEAR_MASS_SELECTION}`, () => {
        test('empties massSelection regardless of its previous value', () => {
            const state = viewSettingsReducer(
                {...viewSettingsInitialState, massSelection: MASS_SELECTION_ALL},
                {type: ViewSettingsActionTypes.CLEAR_MASS_SELECTION},
            );
            expect(state.massSelection).toEqual([]);
        });
    });

    describe(`Action ${ViewSettingsActionTypes.TOGGLE_ATTRIBUTE_COLUMN_SPLIT}`, () => {
        test('adds the attribute id when absent', () => {
            const state = viewSettingsReducer(viewSettingsInitialState, {
                type: ViewSettingsActionTypes.TOGGLE_ATTRIBUTE_COLUMN_SPLIT,
                payload: 'attribute_a',
            });
            expect(state.splitAttributeIds).toEqual(['attribute_a']);
        });

        test('removes the attribute id when already present', () => {
            const state = viewSettingsReducer(
                {...viewSettingsInitialState, splitAttributeIds: ['attribute_a', 'attribute_b']},
                {type: ViewSettingsActionTypes.TOGGLE_ATTRIBUTE_COLUMN_SPLIT, payload: 'attribute_a'},
            );
            expect(state.splitAttributeIds).toEqual(['attribute_b']);
        });
    });

    describe(`Action ${ViewSettingsActionTypes.RESET}`, () => {
        test('replaces the whole state with the payload', () => {
            const dirtyState: IViewSettingsState = {
                ...viewSettingsInitialState,
                fulltextSearch: 'foo',
                pageSize: 99,
                massSelection: ['a'],
            };
            const nextState: IViewSettingsState = {
                ...viewSettingsInitialState,
                libraryId: 'my_lib',
                entrypoint: {type: 'library', libraryId: 'my_lib'},
            };
            const state = viewSettingsReducer(dirtyState, {
                type: ViewSettingsActionTypes.RESET,
                payload: nextState,
            });
            expect(state).toEqual(nextState);
        });
    });

    test('returns the same state reference for an unhandled action', () => {
        const state = viewSettingsReducer(viewSettingsInitialState, {
            type: 'UNKNOWN_ACTION',
        } as unknown as IViewSettingsAction);
        expect(state).toBe(viewSettingsInitialState);
    });
});
