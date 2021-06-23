// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import {mockFormElementInput} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import {mockModifier} from '__mocks__/common/value';
import standardFieldValueReducer from '.';
import {IStandardFieldReducerState, newValueId, StandardFieldReducerActionsTypes} from './standardFieldReducer';

describe('standardFieldReducer', () => {
    const mockAttribute = {
        id: 'test_attribute',
        system: false,
        label: {fr: 'Test Attribute'},
        type: AttributeType.simple,
        format: AttributeFormat.text
    };

    const idValue = '123';
    const idValueNull = null;

    const mockValue = {
        index: 0,
        displayValue: 'my value',
        editingValue: 'my raw value',
        originRawValue: 'my raw value',
        idValue: null,
        isEditing: false,
        isErrorDisplayed: false,
        value: {
            id_value: null,
            value: 'my value',
            raw_value: 'my raw value',
            modified_at: null,
            created_at: null,
            created_by: null,
            modified_by: null
        },
        error: ''
    };

    const initialState: IStandardFieldReducerState = {
        record: mockRecordWhoAmI,
        formElement: mockFormElementInput,
        attribute: mockAttribute,
        isReadOnly: false,
        values: {[idValue]: mockValue}
    };

    test('ADD_VALUE', async () => {
        const newState = standardFieldValueReducer(initialState, {
            type: StandardFieldReducerActionsTypes.ADD_VALUE
        });

        expect(Object.keys(newState.values).length).toBe(Object.keys(initialState.values).length + 1);
        expect(newState.values[newValueId]).toBeDefined();
        expect(newState.values[newValueId].isEditing).toBe(true);
    });

    test('CHANGE_VALUE', async () => {
        const newState = standardFieldValueReducer(initialState, {
            type: StandardFieldReducerActionsTypes.CHANGE_VALUE,
            idValue,
            value: 'my new value modified'
        });

        expect(newState.values[idValue]).toEqual({...mockValue, editingValue: 'my new value modified'});
    });

    test('FOCUS_FIELD', async () => {
        const newState = standardFieldValueReducer(initialState, {
            type: StandardFieldReducerActionsTypes.FOCUS_FIELD,
            idValue
        });

        expect(newState.values[idValue]).toEqual({...mockValue, isEditing: true});
    });

    test('SET_ERROR', async () => {
        const newState = standardFieldValueReducer(initialState, {
            type: StandardFieldReducerActionsTypes.SET_ERROR,
            idValue,
            error: 'boom'
        });

        expect(newState.values[idValue]).toEqual({...mockValue, error: 'boom', isErrorDisplayed: true});
    });

    test('UNEDIT_FIELD', async () => {
        const newState = standardFieldValueReducer(
            {...initialState, values: {[idValue]: {...mockValue, isEditing: true}}},
            {
                type: StandardFieldReducerActionsTypes.UNEDIT_FIELD,
                idValue
            }
        );
        expect(newState.values[idValue]).toEqual({...mockValue, isEditing: false});
    });

    test('CLEAR_ERROR', async () => {
        const newState = standardFieldValueReducer(
            {...initialState, values: {[idValue]: {...mockValue, error: 'boom', isErrorDisplayed: true}}},
            {
                type: StandardFieldReducerActionsTypes.CLEAR_ERROR,
                idValue
            }
        );
        expect(newState.values[idValue]).toEqual({...mockValue, error: '', isErrorDisplayed: false});
    });

    test('SET_ERROR_DISPLAY', async () => {
        const newState = standardFieldValueReducer(
            {...initialState, values: {[idValue]: {...mockValue, isErrorDisplayed: false}}},
            {
                type: StandardFieldReducerActionsTypes.SET_ERROR_DISPLAY,
                idValue,
                displayError: true
            }
        );
        expect(newState.values[idValue]).toEqual({...mockValue, isErrorDisplayed: true});
    });

    test('UPDATE_AFTER_SUBMIT', async () => {
        const newState = standardFieldValueReducer(
            {...initialState, values: {[idValue]: {...mockValue, error: 'boom', isErrorDisplayed: true}}},
            {
                type: StandardFieldReducerActionsTypes.UPDATE_AFTER_SUBMIT,
                idValue,
                newValue: {
                    id_value: null,
                    value: 'updated value',
                    raw_value: 'updated raw value',
                    modified_at: null,
                    created_at: null,
                    created_by: mockModifier,
                    modified_by: mockModifier
                }
            }
        );
        expect(newState.values[idValue]).toMatchObject({
            ...mockValue,
            value: {
                id_value: null,
                value: 'updated value',
                raw_value: 'updated raw value',
                modified_at: null,
                created_at: null
            },
            displayValue: 'updated value',
            editingValue: 'updated raw value',
            originRawValue: 'updated raw value',
            isErrorDisplayed: false,
            error: '',
            isEditing: false
        });
    });

    test('UPDATE_AFTER_SUBMIT on new value', async () => {
        const newState = standardFieldValueReducer(
            {
                ...initialState,
                values: {
                    ...initialState.values,
                    [newValueId]: {...mockValue}
                }
            },
            {
                type: StandardFieldReducerActionsTypes.UPDATE_AFTER_SUBMIT,
                idValue: newValueId,
                newValue: {
                    id_value: '789654',
                    value: 'updated value',
                    raw_value: 'updated raw value',
                    modified_at: 1234567890,
                    created_at: 1234567890,
                    created_by: mockModifier,
                    modified_by: mockModifier
                }
            }
        );
        expect(newState.values[newValueId]).toBeUndefined();
        expect(newState.values['789654']).toMatchObject({
            ...mockValue,
            idValue: '789654',
            value: {
                id_value: '789654',
                value: 'updated value',
                raw_value: 'updated raw value',
                modified_at: 1234567890,
                created_at: 1234567890
            },
            displayValue: 'updated value',
            editingValue: 'updated raw value',
            originRawValue: 'updated raw value',
            isErrorDisplayed: false,
            error: '',
            isEditing: false
        });
    });

    test('UPDATE_AFTER_DELETE', async () => {
        const newState = standardFieldValueReducer(
            {
                ...initialState,
                values: {
                    ...initialState.values,
                    [idValue]: {
                        ...mockValue
                    }
                }
            },
            {
                type: StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE,
                idValue
            }
        );

        expect(newState.values[idValue]).toBeUndefined();
    });

    test('UPDATE_AFTER_DELETE if only one value', async () => {
        const newState = standardFieldValueReducer(
            {...initialState, values: {[idValue]: {...mockValue}}},
            {
                type: StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE,
                idValue
            }
        );

        expect(newState.values[idValue]).toBeUndefined();
        expect(newState.values[newValueId]).toBeDefined();
        expect(newState.values[newValueId].idValue).toBe(newValueId);
        expect(newState.values[newValueId].displayValue).toBe('');
    });

    test('CANCEL_EDITING', async () => {
        const newState = standardFieldValueReducer(
            {...initialState, values: {[idValue]: {...mockValue, editingValue: 'raw value modified'}}},
            {
                type: StandardFieldReducerActionsTypes.CANCEL_EDITING,
                idValue
            }
        );
        expect(newState.values[idValue]).toEqual({
            ...mockValue,
            editingValue: 'my raw value'
        });
    });

    test('CANCEL_EDITING on new value', async () => {
        const newState = standardFieldValueReducer(
            {
                ...initialState,
                values: {'123': {...mockValue}, [newValueId]: {...mockValue, editingValue: 'raw value modified'}}
            },
            {
                type: StandardFieldReducerActionsTypes.CANCEL_EDITING,
                idValue: newValueId
            }
        );
        expect(newState.values[newValueId]).toBeUndefined();
    });

    test('CANCEL_EDITING when new value is the only value', async () => {
        const newState = standardFieldValueReducer(
            {...initialState, values: {[newValueId]: {...mockValue, editingValue: 'raw value modified'}}},
            {
                type: StandardFieldReducerActionsTypes.CANCEL_EDITING,
                idValue: newValueId
            }
        );
        expect(newState.values[newValueId]).toBeDefined();
        expect(newState.values[newValueId].editingValue).toBe('');
    });
});
