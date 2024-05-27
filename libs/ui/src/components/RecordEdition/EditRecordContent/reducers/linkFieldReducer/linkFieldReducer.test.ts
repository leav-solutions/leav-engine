// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import getActiveFieldValues from '_ui/components/RecordEdition/EditRecordContent/helpers/getActiveFieldValues';
import {FieldScope} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm/useGetRecordForm';
import {mockFormElementLinkVersionable, mockLinkValue} from '_ui/__mocks__/common/form';
import linkFieldReducer, {ILinkFieldState, LinkFieldReducerActionsType, virginState} from './linkFieldReducer';

describe('linkFieldReducer', () => {
    const initialLinkFieldState = virginState as ILinkFieldState<RecordFormElementsValueLinkValue>;
    test('ADD_VALUE', () => {
        const newState = linkFieldReducer(initialLinkFieldState, {
            type: LinkFieldReducerActionsType.ADD_VALUES,
            values: [
                {
                    ...mockLinkValue,
                    id_value: '1'
                },
                {
                    ...mockLinkValue,
                    id_value: '2'
                }
            ]
        });

        const activeValues = getActiveFieldValues(newState);
        expect(activeValues).toHaveLength(2);
        expect(activeValues[0].id_value).toBe('1');
        expect(activeValues[1].id_value).toBe('2');
    });

    test('DELETE_VALUE', () => {
        const newState = linkFieldReducer(
            {
                ...initialLinkFieldState,
                values: {
                    ...virginState.values,
                    [virginState.activeScope]: {
                        version: null,
                        values: [
                            {
                                ...mockLinkValue,
                                id_value: '1'
                            },
                            {
                                ...mockLinkValue,
                                id_value: '2'
                            }
                        ]
                    }
                }
            },
            {
                type: LinkFieldReducerActionsType.DELETE_VALUE,
                idValue: '1'
            }
        );

        const activeValues = getActiveFieldValues(newState);
        expect(activeValues).toEqual([
            {
                ...mockLinkValue,
                id_value: '2'
            }
        ]);
    });

    test('DELETE_ALL_VALUES', () => {
        const newState = linkFieldReducer(
            {
                ...initialLinkFieldState,
                values: {
                    ...virginState.values,
                    [virginState.activeScope]: {
                        version: null,
                        values: [
                            {
                                ...mockLinkValue,
                                id_value: '1'
                            },
                            {
                                ...mockLinkValue,
                                id_value: '2'
                            }
                        ]
                    }
                }
            },
            {
                type: LinkFieldReducerActionsType.DELETE_ALL_VALUES
            }
        );

        const activeValues = getActiveFieldValues(newState);
        expect(activeValues).toEqual([]);
    });
    test('SET_ERROR_MESSAGE', () => {
        const newState = linkFieldReducer(initialLinkFieldState, {
            type: LinkFieldReducerActionsType.SET_ERROR_MESSAGE,
            errorMessage: 'error'
        });

        expect(newState.errorMessage).toBe('error');
    });

    test('CLEAR_ERROR_MESSAGE', () => {
        const newState = linkFieldReducer(
            {...initialLinkFieldState, errorMessage: 'error'},
            {
                type: LinkFieldReducerActionsType.CLEAR_ERROR_MESSAGE
            }
        );

        expect(newState.errorMessage).toBe('');
    });

    test('SET_IS_VALUES_ADD_VISIBLE', () => {
        const newState = linkFieldReducer(initialLinkFieldState, {
            type: LinkFieldReducerActionsType.SET_IS_VALUES_ADD_VISIBLE,
            isValuesAddVisible: true
        });

        expect(newState.isValuesAddVisible).toBe(true);
    });

    test('CHANGE_ACTIVE_SCOPE', () => {
        const newState = linkFieldReducer(initialLinkFieldState, {
            type: LinkFieldReducerActionsType.CHANGE_ACTIVE_SCOPE,
            scope: FieldScope.INHERITED
        });

        expect(newState.activeScope).toBe(FieldScope.INHERITED);
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

        const newState = linkFieldReducer(
            {...initialLinkFieldState, formElement: mockFormElementLinkVersionable},
            {
                type: LinkFieldReducerActionsType.REFRESH_VALUES,
                formVersion,
                values: [
                    {
                        ...mockLinkValue,
                        id_value: '123456',
                        version: valuesVersion,
                        metadata: null
                    }
                ]
            }
        );

        expect(newState.activeScope).toBe(FieldScope.INHERITED);
        expect(newState.values[FieldScope.INHERITED].version).toBe(valuesVersion);
        expect(newState.values[FieldScope.INHERITED].values).toHaveLength(1);
        expect(newState.values[FieldScope.INHERITED].values[0].id_value).toBe('123456');
        expect(newState.values[FieldScope.CURRENT].values).toEqual([]);
    });
});
