// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockSelectedAttributeA, mockSelectedAttributeB, mockSelectedAttributeC} from '_ui/__mocks__/common/attribute';
import attributeSelectionListReducer, {
    AttributesSelectionListAction,
    AttributesSelectionListActionTypes,
    IAttributesSelectionListState,
    initialState
} from './attributesSelectionListReducer';

describe('attributesSelectionListReducer', () => {
    const state: IAttributesSelectionListState = {
        ...initialState
    };

    describe('TOGGLE_ATTRIBUTE_SELECTION', () => {
        const action: AttributesSelectionListAction = {
            type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_SELECTION,
            attribute: mockSelectedAttributeA
        };

        test('Select new attribute', async () => {
            expect(
                attributeSelectionListReducer(state, {
                    ...action
                }).selectedAttributes
            ).toEqual([mockSelectedAttributeA]);
        });

        test('Unselect attribute', async () => {
            expect(
                attributeSelectionListReducer(
                    {...state, selectedAttributes: [mockSelectedAttributeA]},
                    {
                        ...action
                    }
                ).selectedAttributes
            ).toEqual([]);
        });

        test('Select attribute, not multiple', async () => {
            expect(
                attributeSelectionListReducer(
                    {...state, multiple: false, selectedAttributes: [mockSelectedAttributeA]},
                    {
                        ...action,
                        attribute: mockSelectedAttributeB
                    }
                ).selectedAttributes
            ).toEqual([mockSelectedAttributeB]);
        });

        test('Unselect attribute, not multiple', async () => {
            expect(
                attributeSelectionListReducer(
                    {...state, multiple: false, selectedAttributes: [mockSelectedAttributeA]},
                    {
                        ...action
                    }
                ).selectedAttributes
            ).toEqual([]);
        });
    });

    describe('TOGGLE_ATTRIBUTE', () => {
        const action: AttributesSelectionListAction = {
            type: AttributesSelectionListActionTypes.TOGGLE_ATTRIBUTE_EXPAND,
            attributePath: ''
        };

        test('Expand attribute', async () => {
            expect(
                attributeSelectionListReducer(state, {
                    ...action,
                    attributePath: 'A'
                }).expandedAttributePath
            ).toBe('A');

            expect(
                attributeSelectionListReducer(
                    {...state, expandedAttributePath: 'A'},
                    {
                        ...action,
                        attributePath: 'B'
                    }
                ).expandedAttributePath
            ).toBe('B');

            expect(
                attributeSelectionListReducer(
                    {...state, expandedAttributePath: 'A'},
                    {
                        ...action,
                        attributePath: 'A.B'
                    }
                ).expandedAttributePath
            ).toBe('A.B');

            expect(
                attributeSelectionListReducer(
                    {...state, expandedAttributePath: 'A.B'},
                    {
                        ...action,
                        attributePath: 'D'
                    }
                ).expandedAttributePath
            ).toBe('D');
        });

        test('Collapse attribute', async () => {
            expect(
                attributeSelectionListReducer(
                    {...state, expandedAttributePath: 'A'},
                    {
                        ...action,
                        attributePath: 'A'
                    }
                ).expandedAttributePath
            ).toBe('');

            expect(
                attributeSelectionListReducer(
                    {...state, expandedAttributePath: 'A.B'},
                    {
                        ...action,
                        attributePath: 'A.B'
                    }
                ).expandedAttributePath
            ).toBe('A');

            expect(
                attributeSelectionListReducer(
                    {...state, expandedAttributePath: 'A.B.C'},
                    {
                        ...action,
                        attributePath: 'A.B'
                    }
                ).expandedAttributePath
            ).toBe('A');

            expect(
                attributeSelectionListReducer(
                    {...state, expandedAttributePath: 'A.B.C'},
                    {
                        ...action,
                        attributePath: 'A.B.C'
                    }
                ).expandedAttributePath
            ).toBe('A.B');
        });
    });

    describe('MOVE_SELECTED_ATTRIBUTE', () => {
        const action: AttributesSelectionListAction = {
            type: AttributesSelectionListActionTypes.MOVE_SELECTED_ATTRIBUTE,
            from: 0,
            to: 1
        };

        const stateWithSelection = {
            ...state,
            selectedAttributes: [mockSelectedAttributeA, mockSelectedAttributeB, mockSelectedAttributeC]
        };

        test('Move a selected attribute', async () => {
            expect(
                attributeSelectionListReducer(stateWithSelection, {
                    ...action
                }).selectedAttributes
            ).toEqual([mockSelectedAttributeB, mockSelectedAttributeA, mockSelectedAttributeC]);
        });

        test('Handle destination above selection length', async () => {
            expect(
                attributeSelectionListReducer(stateWithSelection, {
                    ...action,
                    to: 42
                }).selectedAttributes
            ).toEqual([mockSelectedAttributeB, mockSelectedAttributeC, mockSelectedAttributeA]);
        });

        test('Handle destination below 0', async () => {
            expect(
                attributeSelectionListReducer(stateWithSelection, {
                    ...action,
                    from: 1,
                    to: -42
                }).selectedAttributes
            ).toEqual([mockSelectedAttributeB, mockSelectedAttributeA, mockSelectedAttributeC]);
        });

        test('Handle invalid source (index not existing)', async () => {
            expect(
                attributeSelectionListReducer(stateWithSelection, {
                    ...action,
                    from: 42
                }).selectedAttributes
            ).toEqual([mockSelectedAttributeA, mockSelectedAttributeB, mockSelectedAttributeC]);
        });
    });
});
