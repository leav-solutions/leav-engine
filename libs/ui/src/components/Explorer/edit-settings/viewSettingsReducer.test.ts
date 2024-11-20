// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {viewSettingsInitialState} from './ViewSetingsContext';
import reducer, {DisplayMode, ViewSettingsActionTypes} from './viewSettingsReducer';

describe('ViewSettings Reducer', () => {
    test.each(['table', 'list', 'mosaic', 'timeline'])('Action CHANGE_DISPLAY_MODE to %s', displayMode => {
        const state = reducer(viewSettingsInitialState, {
            type: ViewSettingsActionTypes.CHANGE_DISPLAY_MODE,
            displayMode: displayMode as DisplayMode
        });
        expect(state.displayMode).toEqual(displayMode);
    });
    test('Action ADD_FIELD test', () => {
        const state = reducer(viewSettingsInitialState, {
            type: ViewSettingsActionTypes.ADD_FIELD,
            field: 'test'
        });
        expect(state.fields).toEqual(['test']);
    });
    test('Action REMOVE_FIELD test', () => {
        const state = reducer(
            {
                ...viewSettingsInitialState,
                fields: ['test', 'active', 'created_at']
            },
            {
                type: ViewSettingsActionTypes.REMOVE_FIELD,
                field: 'test'
            }
        );
        expect(state.fields).toEqual(['active', 'created_at']);
    });

    describe('Action MOVE_FIELD', () => {
        const initialState = {
            ...viewSettingsInitialState,
            fields: ['test', 'active', 'created_at']
        };

        const cases = [
            {
                indexFrom: 0,
                indexTo: 2,
                expected: ['active', 'created_at', 'test']
            },
            {
                indexFrom: 2,
                indexTo: 0,
                expected: ['created_at', 'test', 'active']
            },
            {
                indexFrom: 2,
                indexTo: 1,
                expected: ['test', 'created_at', 'active']
            },
            {
                indexFrom: 0,
                indexTo: 0,
                expected: initialState.fields
            }
        ];

        test.each(cases)('Move field from $indexFrom to $indexTo', ({indexFrom, indexTo, expected}) => {
            const state = reducer(initialState, {
                type: ViewSettingsActionTypes.MOVE_FIELD,
                indexFrom,
                indexTo
            });
            expect(state.fields).toEqual(expected);
        });
    });

    test('Action RESET_FIELDS', () => {
        const state = reducer(
            {
                ...viewSettingsInitialState,
                fields: ['test', 'active', 'created_at']
            },
            {
                type: ViewSettingsActionTypes.RESET_FIELDS
            }
        );
        expect(state.fields).toEqual([]);
    });
});
