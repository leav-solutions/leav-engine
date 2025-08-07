// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TabsDirection} from '@leav/utils';
import {render, screen, fireEvent} from '_ui/_tests/testUtils';
import {mockCommonFormElementProps, mockFormElementTabs} from '_ui/__mocks__/common/form';
import FormTabs from './FormTabs';
import React from 'react';
import {EditRecordReducerContext} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducerContext';
import {
    EditRecordReducerActionsTypes,
    initialState
} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';

// Mock for useEditRecordReducer hook
const createMockEditRecordReducerProvider = (tabActiveIndex = null) => {
    const mockState = {
        ...initialState,
        tabActiveIndex
    };

    const mockDispatch = jest.fn();

    return {
        mockState,
        mockDispatch,
        MockEditRecordReducerProvider: ({children}) => (
            <EditRecordReducerContext.Provider value={{state: mockState, dispatch: mockDispatch}}>
                {children}
            </EditRecordReducerContext.Provider>
        )
    };
};

describe('Tabs', () => {
    test('Render Tabs', async () => {
        render(<FormTabs {...mockCommonFormElementProps} element={mockFormElementTabs} formIdToLoad="edition" />);

        expect(screen.getAllByRole('tab').length).toBe(2);
    });

    test('Render vertical Tabs', () => {
        render(
            <FormTabs
                {...mockCommonFormElementProps}
                element={{
                    ...mockFormElementTabs,
                    settings: {...mockFormElementTabs.settings, direction: TabsDirection.VERTICAL}
                }}
                formIdToLoad="edition"
            />
        );

        expect(screen.getByTestId('form-tabs')).toHaveClass('ant-tabs-left');
    });

    test('Restores tab index from editRecordReducer', () => {
        // Set up mock with tab2 as the active tab
        const {MockEditRecordReducerProvider} = createMockEditRecordReducerProvider('tab2');

        render(
            <MockEditRecordReducerProvider>
                <FormTabs {...mockCommonFormElementProps} element={mockFormElementTabs} formIdToLoad="edition" />
            </MockEditRecordReducerProvider>
        );

        // Check that the second tab is active (tab2)
        const tabs = screen.getAllByRole('tab');
        expect(tabs.length).toBe(2);

        // In antd Tabs, the active tab has aria-selected="true"
        expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    });

    test('Updates editRecordReducer when tab is clicked', () => {
        // Set up mock with initial state
        const {MockEditRecordReducerProvider, mockDispatch} = createMockEditRecordReducerProvider();

        render(
            <MockEditRecordReducerProvider>
                <FormTabs {...mockCommonFormElementProps} element={mockFormElementTabs} formIdToLoad="edition" />
            </MockEditRecordReducerProvider>
        );

        // Get all tabs
        const tabs = screen.getAllByRole('tab');

        // Click on the second tab
        fireEvent.click(tabs[1]);

        // Verify that dispatch was called with the correct action
        expect(mockDispatch).toHaveBeenCalledWith({
            type: EditRecordReducerActionsTypes.UPDATE_TAB_ACTIVE_INDEX,
            tabActiveIndex: 'tab2'
        });
    });

    test('Selects first tab by default when tabIndex is null', () => {
        // Set up mock with null tabActiveIndex (default)
        const {MockEditRecordReducerProvider} = createMockEditRecordReducerProvider(null);

        render(
            <MockEditRecordReducerProvider>
                <FormTabs {...mockCommonFormElementProps} element={mockFormElementTabs} formIdToLoad="edition" />
            </MockEditRecordReducerProvider>
        );

        // Get all tabs
        const tabs = screen.getAllByRole('tab');
        expect(tabs.length).toBe(2);

        // Check that the first tab is active by default
        expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    });
});
