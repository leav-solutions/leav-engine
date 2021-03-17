// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import standardFieldReducer from '.';
import {IStandardFieldReducerState, StandardFieldReducerActionsTypes} from './standardFieldReducer';

describe('standardFieldReducer', () => {
    const mockAttribute = {
        id: 'test_attribute',
        system: false,
        label: {fr: 'Test Attribute'},
        type: AttributeType.simple,
        format: AttributeFormat.text
    };
    const initialState: IStandardFieldReducerState = {
        attribute: mockAttribute,
        displayValue: 'my value',
        editingValue: 'my raw value',
        originRawValue: 'my raw value',
        idValue: null,
        isEditing: false,
        isErrorDisplayed: false,
        isReadOnly: false,
        value: {id_value: null, value: 'my value', raw_value: 'my raw value', modified_at: null, created_at: null},
        error: ''
    };

    test('CHANGE_VALUE', async () => {
        expect(
            standardFieldReducer(initialState, {
                type: StandardFieldReducerActionsTypes.CHANGE_VALUE,
                value: 'my new value modified'
            })
        ).toEqual({...initialState, editingValue: 'my new value modified'});
    });

    test('FOCUS_FIELD', async () => {
        expect(
            standardFieldReducer(initialState, {
                type: StandardFieldReducerActionsTypes.FOCUS_FIELD
            })
        ).toEqual({...initialState, isEditing: true});
    });

    test('SET_ERROR', async () => {
        expect(
            standardFieldReducer(initialState, {
                type: StandardFieldReducerActionsTypes.SET_ERROR,
                error: 'boom'
            })
        ).toEqual({...initialState, error: 'boom', isErrorDisplayed: true});
    });

    test('UNEDIT_FIELD', async () => {
        expect(
            standardFieldReducer(
                {...initialState, isEditing: true},
                {
                    type: StandardFieldReducerActionsTypes.UNEDIT_FIELD
                }
            )
        ).toEqual({...initialState, isEditing: false});
    });

    test('CLEAR_ERROR', async () => {
        expect(
            standardFieldReducer(
                {...initialState, error: 'boom', isErrorDisplayed: true},
                {
                    type: StandardFieldReducerActionsTypes.CLEAR_ERROR
                }
            )
        ).toEqual({...initialState, error: '', isErrorDisplayed: false});
    });

    test('SET_ERROR_DISPLAY', async () => {
        expect(
            standardFieldReducer(
                {...initialState, isErrorDisplayed: false},
                {
                    type: StandardFieldReducerActionsTypes.SET_ERROR_DISPLAY,
                    displayError: true
                }
            )
        ).toEqual({...initialState, isErrorDisplayed: true});
    });

    test('UPDATE_AFTER_SUBMIT', async () => {
        expect(
            standardFieldReducer(
                {...initialState, error: 'boom', isErrorDisplayed: true},
                {
                    type: StandardFieldReducerActionsTypes.UPDATE_AFTER_SUBMIT,
                    newValue: {
                        id_value: null,
                        value: 'updated value',
                        raw_value: 'updated raw value',
                        modified_at: null,
                        created_at: null
                    }
                }
            )
        ).toEqual({
            ...initialState,
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

    test('UPDATE_AFTER_DELETE', async () => {
        expect(
            standardFieldReducer(
                {...initialState},
                {
                    type: StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE
                }
            )
        ).toEqual({
            ...initialState,
            value: null,
            displayValue: '',
            editingValue: '',
            originRawValue: '',
            isEditing: false,
            isErrorDisplayed: false,
            error: ''
        });
    });

    test('CANCEL_EDITING', async () => {
        expect(
            standardFieldReducer(
                {...initialState, editingValue: 'raw value modified'},
                {
                    type: StandardFieldReducerActionsTypes.CANCEL_EDITING
                }
            )
        ).toEqual({
            ...initialState,
            editingValue: 'my raw value'
        });
    });
});
