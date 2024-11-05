// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import reducer, {ActionTypes, initialState} from './NavigatorReducer';

describe('Navigator Reducer', () => {
    test('Action SET_RESTRICT_ROOTS 0 to 5 roots', () => {
        for (let i = 0; i < 5; i++) {
            const state = reducer(initialState, {
                type: ActionTypes.SET_RESTRICT_ROOTS,
                data: Array(i)
            });
            expect(state.restrictToRoots).toHaveLength(i);
        }
    });
    test('Action SET_RESTRICT_ROOTS with 1 root', () => {
        const state = reducer(initialState, {
            type: ActionTypes.SET_RESTRICT_ROOTS,
            data: ['test']
        });
        expect(state.restrictToRoots).toHaveLength(1);
        expect(state.selectedRoot).toBe('test');
    });
    test('Action SET_SELECTED_ROOT', () => {
        const state = reducer(initialState, {
            type: ActionTypes.SET_SELECTED_ROOT,
            data: 'test'
        });
        expect(state.selectedRoot).toBe('test');
    });
    test('Action SET_ROOT_INFOS', () => {
        const state = reducer(initialState, {
            type: ActionTypes.SET_ROOT_INFOS,
            data: {
                query: 'test'
            }
        });
        expect(state.selectedRoot).toBe('test');
    });
    test('Action SET_ROOTS', () => {
        const state = reducer(initialState, {
            type: ActionTypes.SET_ROOTS,
            data: [
                {
                    id: 'test'
                },
                {
                    id: 'test2'
                }
            ]
        });
        expect(state.rootsList).toHaveLength(2);
        expect(state.rootsList[1].id).toEqual('test2');
    });
    test('Action SET_FILTERS', () => {
        const filters = [
            {
                attribute: 'test',
                value: 'v1',
                operator: '='
            },
            {
                attribute: 'test2',
                value: 'v2',
                operator: '='
            }
        ];
        const state = reducer(initialState, {
            type: ActionTypes.SET_FILTERS,
            data: filters
        });
        expect(state.filters).toHaveLength(2);
        expect(state.filters).toEqual(filters);
    });
    test('Action TOGGLE_FILTERS', () => {
        const state = reducer(initialState, {
            type: ActionTypes.TOGGLE_FILTERS,
            data: null
        });
        expect(state.showFilters).toBe(true);
        const newState = reducer(state, {
            type: ActionTypes.TOGGLE_FILTERS,
            data: null
        });
        expect(newState.showFilters).toBe(false);
    });
    test('Action SET_LIST', () => {
        const state = reducer(initialState, {
            type: ActionTypes.SET_LIST,
            data: {list: [1, 2]}
        });
        expect(state.list).toHaveLength(2);
    });
    test('Action SET_OFFSET', () => {
        const data = {offset: 3, page: 2};
        const state = reducer(initialState, {
            type: ActionTypes.SET_OFFSET,
            data
        });
        expect(state.offset).toBe(3);
        expect(state.currentPage).toBe(2);
    });
    test('Action SET_LIMIT', () => {
        const state = reducer(initialState, {
            type: ActionTypes.SET_LIMIT,
            data: {limit: 25}
        });
        expect(state.selectedOffset).toBe(25);
    });
});
