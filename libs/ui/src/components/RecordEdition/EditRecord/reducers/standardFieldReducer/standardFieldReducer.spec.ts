// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import getActiveFieldValues from '_ui/components/RecordEdition/EditRecord/helpers/getActiveFieldValues';
import {FieldScope} from '_ui/components/RecordEdition/EditRecord/_types';
import {AttributeFormat, AttributeType} from '_ui/_gqlTypes';
import {mockFormElementInput, mockFormElementInputVersionable} from '_ui/__mocks__/common/form';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockModifier} from '_ui/__mocks__/common/value';
import standardFieldValueReducer from '.';
import {
    IStandardFieldReducerState,
    newValueId,
    StandardFieldReducerActionsTypes,
    StandardFieldReducerValues,
    StandardFieldValueState,
    virginValue
} from './standardFieldReducer';

describe('standardFieldReducer', () => {
    const mockAttribute = {
        id: 'test_attribute',
        system: false,
        label: {fr: 'Test Attribute'},
        type: AttributeType.simple,
        format: AttributeFormat.text
    };

    const idValue = '123';

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
        version: null,
        error: '',
        state: StandardFieldValueState.PRISTINE
    };

    const initialState: IStandardFieldReducerState = {
        record: mockRecord,
        formElement: mockFormElementInput,
        attribute: mockAttribute,
        isReadOnly: false,
        activeScope: FieldScope.CURRENT,
        values: {
            [FieldScope.CURRENT]: {
                version: null,
                values: {[idValue]: mockValue}
            },
            [FieldScope.INHERITED]: null
        },
        metadataEdit: false
    };

    const _getInitialStateWithValues = (values: StandardFieldReducerValues): IStandardFieldReducerState => {
        return {
            ...initialState,
            values: {
                ...initialState.values,
                [FieldScope.CURRENT]: {
                    ...initialState.values[FieldScope.CURRENT],
                    values: {...values}
                }
            }
        };
    };

    test('ADD_VALUE', async () => {
        const newState = standardFieldValueReducer(initialState, {
            type: StandardFieldReducerActionsTypes.ADD_VALUE
        });
        const newStateValues = getActiveFieldValues(newState);

        expect(Object.keys(newStateValues).length).toBe(
            Object.keys(initialState.values[initialState.activeScope].values).length + 1
        );
        expect(newStateValues[newValueId]).toBeDefined();
        expect(newStateValues[newValueId].isEditing).toBe(true);
        expect(newStateValues[newValueId].state).toBe(StandardFieldValueState.PRISTINE);
    });

    test('CHANGE_VALUE', async () => {
        const newState = standardFieldValueReducer(initialState, {
            type: StandardFieldReducerActionsTypes.CHANGE_VALUE,
            idValue,
            value: 'my new value modified'
        });
        const newStateValues = getActiveFieldValues(newState);

        expect(newStateValues[idValue]).toEqual({
            ...mockValue,
            editingValue: 'my new value modified',
            state: StandardFieldValueState.DIRTY
        });
    });

    test('FOCUS_FIELD', async () => {
        const newState = standardFieldValueReducer(initialState, {
            type: StandardFieldReducerActionsTypes.FOCUS_FIELD,
            idValue
        });
        const newStateValues = getActiveFieldValues(newState);

        expect(newStateValues[idValue]).toEqual({...mockValue, isEditing: true});
    });

    test('SET_ERROR', async () => {
        const newState = standardFieldValueReducer(initialState, {
            type: StandardFieldReducerActionsTypes.SET_ERROR,
            idValue,
            error: 'boom'
        });
        const newStateValues = getActiveFieldValues(newState);

        expect(newStateValues[idValue]).toEqual({
            ...mockValue,
            state: StandardFieldValueState.DIRTY,
            error: 'boom',
            isErrorDisplayed: true
        });
    });

    test('UNEDIT_FIELD', async () => {
        const newState = standardFieldValueReducer(
            _getInitialStateWithValues({
                [idValue]: {...mockValue, isEditing: true, state: StandardFieldValueState.DIRTY}
            }),
            {
                type: StandardFieldReducerActionsTypes.UNEDIT_FIELD,
                idValue
            }
        );
        const newStateValues = getActiveFieldValues(newState);

        expect(newStateValues[idValue]).toEqual({...mockValue, isEditing: false});
    });

    test('CLEAR_ERROR', async () => {
        const newState = standardFieldValueReducer(
            _getInitialStateWithValues({[idValue]: {...mockValue, error: 'boom', isErrorDisplayed: true}}),
            {
                type: StandardFieldReducerActionsTypes.CLEAR_ERROR,
                idValue
            }
        );
        const newStateValues = getActiveFieldValues(newState);

        expect(newStateValues[idValue]).toEqual({...mockValue, error: '', isErrorDisplayed: false});
    });

    test('SET_ERROR_DISPLAY', async () => {
        const newState = standardFieldValueReducer(
            _getInitialStateWithValues({[idValue]: {...mockValue, isErrorDisplayed: false}}),
            {
                type: StandardFieldReducerActionsTypes.SET_ERROR_DISPLAY,
                idValue,
                displayError: true
            }
        );
        const newStateValues = getActiveFieldValues(newState);

        expect(newStateValues[idValue]).toEqual({...mockValue, isErrorDisplayed: true});
    });

    test('UPDATE_AFTER_SUBMIT', async () => {
        const newState = standardFieldValueReducer(
            _getInitialStateWithValues({
                [idValue]: {
                    ...mockValue,
                    error: 'boom',
                    isErrorDisplayed: true,
                    state: StandardFieldValueState.DIRTY
                }
            }),
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
                    modified_by: mockModifier,
                    version: null,
                    attribute: mockAttribute,
                    metadata: null
                }
            }
        );
        const newStateValues = getActiveFieldValues(newState);

        expect(newStateValues[idValue]).toMatchObject({
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
            isEditing: false,
            state: StandardFieldValueState.PRISTINE
        });
    });

    test('UPDATE_AFTER_SUBMIT on new value', async () => {
        const newState = standardFieldValueReducer(
            _getInitialStateWithValues({[newValueId]: {...mockValue, state: StandardFieldValueState.DIRTY}}),
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
                    modified_by: mockModifier,
                    version: null,
                    attribute: mockAttribute,
                    metadata: null
                }
            }
        );
        const newStateValues = getActiveFieldValues(newState);

        expect(newStateValues[newValueId]).toBeUndefined();
        expect(newStateValues['789654']).toMatchObject({
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
            isEditing: false,
            state: StandardFieldValueState.PRISTINE
        });
    });

    test('UPDATE_AFTER_DELETE', async () => {
        const newState = standardFieldValueReducer(
            _getInitialStateWithValues({
                [idValue]: {
                    ...mockValue
                }
            }),
            {
                type: StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE,
                idValue
            }
        );
        const newStateValues = getActiveFieldValues(newState);

        expect(newStateValues[idValue]).toBeUndefined();
    });

    test('UPDATE_AFTER_DELETE if only one value', async () => {
        const newState = standardFieldValueReducer(_getInitialStateWithValues({[idValue]: {...mockValue}}), {
            type: StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE,
            idValue
        });
        const newStateValues = getActiveFieldValues(newState);

        expect(newStateValues[idValue]).toBeUndefined();
        expect(newStateValues[newValueId]).toBeDefined();
        expect(newStateValues[newValueId].idValue).toBe(newValueId);
        expect(newStateValues[newValueId].displayValue).toBe('');
    });

    test('UPDATE_AFTER_DELETE if deleting all values', async () => {
        const newState = standardFieldValueReducer(
            _getInitialStateWithValues({[idValue]: {...mockValue}, [idValue + '2']: {...mockValue}}),
            {
                type: StandardFieldReducerActionsTypes.UPDATE_AFTER_DELETE,
                allDeleted: true
            }
        );
        const newStateValues = getActiveFieldValues(newState);

        expect(Object.keys(newStateValues)).toEqual([newValueId]);
    });

    test('CANCEL_EDITING', async () => {
        const newState = standardFieldValueReducer(
            _getInitialStateWithValues({
                [idValue]: {...mockValue, editingValue: 'raw value modified', state: StandardFieldValueState.DIRTY}
            }),
            {
                type: StandardFieldReducerActionsTypes.CANCEL_EDITING,
                idValue
            }
        );
        const newStateValues = getActiveFieldValues(newState);

        expect(newStateValues[idValue]).toEqual({
            ...mockValue,
            editingValue: 'my raw value',
            state: StandardFieldValueState.PRISTINE
        });
    });

    test('CANCEL_EDITING on new value', async () => {
        const newState = standardFieldValueReducer(
            _getInitialStateWithValues({
                '123': {...mockValue},
                [newValueId]: {
                    ...mockValue,
                    editingValue: 'raw value modified',
                    state: StandardFieldValueState.DIRTY
                }
            }),
            {
                type: StandardFieldReducerActionsTypes.CANCEL_EDITING,
                idValue: newValueId
            }
        );
        const newStateValues = getActiveFieldValues(newState);

        expect(newStateValues[newValueId]).toBeUndefined();
    });

    test('CANCEL_EDITING when new value is the only value', async () => {
        const newState = standardFieldValueReducer(
            _getInitialStateWithValues({
                [newValueId]: {
                    ...mockValue,
                    editingValue: 'raw value modified',
                    state: StandardFieldValueState.DIRTY
                }
            }),
            {
                type: StandardFieldReducerActionsTypes.CANCEL_EDITING,
                idValue: newValueId
            }
        );
        const newStateValues = getActiveFieldValues(newState);

        expect(newStateValues[newValueId]).toBeDefined();
        expect(newStateValues[newValueId].editingValue).toBe('');
        expect(newStateValues[newValueId].state).toBe(StandardFieldValueState.PRISTINE);
    });

    test('CHANGE_VERSION', async () => {
        // Clear all values, and add new one linked to given version
        const inheritedVersion = {
            lang: {
                id: '1337',
                label: 'English'
            }
        };

        const currentVersion = {
            lang: {
                id: '42',
                label: 'Français'
            }
        };

        const newState = standardFieldValueReducer(
            {
                ...initialState,
                activeScope: FieldScope.INHERITED,
                values: {
                    [FieldScope.INHERITED]: {
                        version: inheritedVersion,
                        values: {
                            '123465789': {
                                ...mockValue,
                                value: {
                                    ...mockValue.value
                                },
                                editingValue: 'raw value modified',
                                state: StandardFieldValueState.DIRTY
                            },
                            '987654321': {
                                ...mockValue,
                                value: {
                                    ...mockValue.value
                                },
                                editingValue: 'raw value modified',
                                state: StandardFieldValueState.DIRTY
                            }
                        }
                    },
                    [FieldScope.CURRENT]: {
                        version: currentVersion,
                        values: {
                            [newValueId]: {
                                ...virginValue
                            }
                        }
                    }
                }
            },
            {
                type: StandardFieldReducerActionsTypes.CHANGE_VERSION_SCOPE,
                scope: FieldScope.CURRENT
            }
        );
        const newStateValues = getActiveFieldValues(newState);

        expect(newState.activeScope).toBe(FieldScope.CURRENT);
        expect(Object.keys(newStateValues)).toHaveLength(1);
        expect(newStateValues[newValueId]).toBeDefined();
    });

    test('REFRESH_VALUES', async () => {
        const formVersion = {
            lang: {
                id: '1337',
                label: 'English'
            }
        };

        const valuesVersion = {
            lang: {
                id: '42',
                label: 'Français'
            }
        };

        const newState = standardFieldValueReducer(
            {...initialState, formElement: mockFormElementInputVersionable},
            {
                type: StandardFieldReducerActionsTypes.REFRESH_VALUES,
                formVersion,
                values: [
                    {
                        ...mockValue.value,
                        id_value: '123456',
                        version: valuesVersion,
                        metadata: null
                    }
                ]
            }
        );

        expect(newState.activeScope).toBe(FieldScope.INHERITED);
        expect(newState.values[FieldScope.INHERITED].version).toBe(valuesVersion);
        expect(newState.values[FieldScope.INHERITED].values['123456']).toBeDefined();
        expect(newState.values[FieldScope.CURRENT].values[newValueId]).toBeDefined();
    });
});
