// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import reducer, {StandardValuesActionTypes} from './StandardValuesReducer';

describe('StandardValuesReducer', () => {
    const testVal = {
        id_value: '12345',
        value: 'test_val',
        raw_value: 'test_val',
        modified_at: null,
        created_at: null,
        version: null
    };
    const initialState = {
        values: [
            {
                ...testVal
            }
        ],
        initialValues: [
            {
                ...testVal
            }
        ]
    };

    test('Action REINIT', () => {
        const newState = reducer(initialState, {
            type: StandardValuesActionTypes.REINIT,
            data: {
                values: [{id_value: '98765', value: 'test'}]
            }
        });

        expect(newState.values).toHaveLength(1);
        expect(newState.values[0].id_value).toBe('98765');
    });

    test('Action ADD', () => {
        const newState = reducer(initialState, {
            type: StandardValuesActionTypes.ADD
        });

        expect(newState.values).toHaveLength(2);
    });

    test('Action CHANGE', () => {
        const newState = reducer(initialState, {
            type: StandardValuesActionTypes.CHANGE,
            data: {
                valueIndex: 0,
                newValue: 'new_val'
            }
        });

        expect(newState.values[0].value).toBe('new_val');
    });

    test('Action SUBMIT', () => {
        const newState = reducer(
            {...initialState, values: [{...testVal, value: 'submitted_val'}]},
            {
                type: StandardValuesActionTypes.SUBMIT,
                data: {
                    valueIndex: 0
                }
            }
        );

        expect(newState.initialValues[0].value).toBe('submitted_val');
    });

    test('Action DELETE: delete value', () => {
        const newState = reducer(
            {...initialState, values: [{...testVal}, {...testVal}]},
            {
                type: StandardValuesActionTypes.DELETE,
                data: {valueIndex: 1}
            }
        );

        expect(newState.values).toHaveLength(1);
    });

    test('Action DELETE: delete value and insert new one if empty', () => {
        const newState = reducer(initialState, {
            type: StandardValuesActionTypes.DELETE
        });

        expect(newState.values).toHaveLength(1);
        expect(newState.values[0].id_value).toBe(null);
    });

    test('Action CANCEL', () => {
        const newState = reducer(
            {...initialState, values: [{...testVal, value: 'edited_val'}]},
            {
                type: StandardValuesActionTypes.CANCEL,
                data: {
                    valueIndex: 0
                }
            }
        );

        expect(newState.values[0].value).toBe('test_val');
    });
});
