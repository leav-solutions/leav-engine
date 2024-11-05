// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockAttributeSimple} from '_ui/__mocks__/common/attribute';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockRecordPropertyWithAttribute} from '_ui/__mocks__/common/value';
import editRecordReducer, {
    EditRecordReducerActionsTypes,
    IEditRecordReducerState,
    initialState
} from './editRecordReducer';

describe('editRecordReducer', () => {
    const mockInitialState: IEditRecordReducerState = {
        ...initialState,
        record: mockRecord
    };

    test('SET_ACTIVE_VALUE', async () => {
        const newState = editRecordReducer(mockInitialState, {
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            value: mockRecordPropertyWithAttribute
        });
        expect(newState.activeValue).toEqual(mockRecordPropertyWithAttribute);
        expect(newState.sidebarContent).toBe('valueDetails');

        const newState2 = editRecordReducer(mockInitialState, {
            type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
            value: null
        });
        expect(newState2.sidebarContent).toBe('summary');
    });

    test('SET_SIDEBAR_CONTENT', async () => {
        expect(
            editRecordReducer(mockInitialState, {
                type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT,
                content: 'valueDetails'
            }).sidebarContent
        ).toBe('valueDetails');
    });

    describe('SET_EXTERNAL_UPDATE', () => {
        const baseValue = {
            id_value: null,
            attribute: mockAttributeSimple,
            created_at: null,
            created_by: null,
            modified_at: null,
            modified_by: null,
            version: null,
            metadata: null
        };

        test('Multiple updates from different modifiers', async () => {
            const newState = editRecordReducer(mockInitialState, {
                type: EditRecordReducerActionsTypes.ADD_EXTERNAL_UPDATE,
                modifier: mockRecord,
                updatedValues: [
                    {
                        attribute: 'attribute1',
                        value: {
                            ...baseValue,
                            value: 'test',
                            raw_value: 'test',
                            attribute: {...mockAttributeSimple, id: 'attribute1'}
                        }
                    }
                ]
            });

            const newState2 = editRecordReducer(newState, {
                type: EditRecordReducerActionsTypes.ADD_EXTERNAL_UPDATE,
                modifier: {...mockRecord, id: 'modifier2'},
                updatedValues: [
                    {
                        attribute: 'attribute2',
                        value: {
                            ...baseValue,
                            value: 'test2',
                            raw_value: 'test2',
                            attribute: {...mockAttributeSimple, id: 'attribute2'}
                        }
                    }
                ]
            });

            expect(newState2.externalUpdate).toEqual({
                modifiers: [mockRecord, {...mockRecord, id: 'modifier2'}],
                updatedValues: {
                    attribute1: [
                        {
                            ...baseValue,
                            value: 'test',
                            raw_value: 'test',
                            attribute: {...mockAttributeSimple, id: 'attribute1'}
                        }
                    ],
                    attribute2: [
                        {
                            ...baseValue,
                            value: 'test2',
                            raw_value: 'test2',
                            attribute: {...mockAttributeSimple, id: 'attribute2'}
                        }
                    ]
                }
            });
        });

        test('Multiple updates from same modifier', async () => {
            const newState = editRecordReducer(mockInitialState, {
                type: EditRecordReducerActionsTypes.ADD_EXTERNAL_UPDATE,
                modifier: mockRecord,
                updatedValues: [
                    {
                        attribute: 'attribute1',
                        value: {
                            ...baseValue,
                            value: 'test',
                            raw_value: 'test',
                            attribute: {...mockAttributeSimple, id: 'attribute1'}
                        }
                    }
                ]
            });

            const newState2 = editRecordReducer(newState, {
                type: EditRecordReducerActionsTypes.ADD_EXTERNAL_UPDATE,
                modifier: mockRecord,
                updatedValues: [
                    {
                        attribute: 'attribute2',
                        value: {
                            ...baseValue,
                            value: 'test2',
                            raw_value: 'test2',
                            attribute: {...mockAttributeSimple, id: 'attribute2'}
                        }
                    }
                ]
            });

            expect(newState2.externalUpdate).toEqual({
                modifiers: [mockRecord],
                updatedValues: {
                    attribute1: [
                        {
                            ...baseValue,
                            value: 'test',
                            raw_value: 'test',
                            attribute: {...mockAttributeSimple, id: 'attribute1'}
                        }
                    ],
                    attribute2: [
                        {
                            ...baseValue,
                            value: 'test2',
                            raw_value: 'test2',
                            attribute: {...mockAttributeSimple, id: 'attribute2'}
                        }
                    ]
                }
            });
        });
    });

    test('CLEAR_EXTERNAL_UPDATE', async () => {
        const newState = editRecordReducer(mockInitialState, {
            type: EditRecordReducerActionsTypes.CLEAR_EXTERNAL_UPDATE
        });
        expect(newState.externalUpdate).toEqual(initialState.externalUpdate);
    });
});
