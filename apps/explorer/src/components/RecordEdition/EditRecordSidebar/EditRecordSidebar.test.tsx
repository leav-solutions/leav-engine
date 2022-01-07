// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act} from 'react-dom/test-utils';
import {render, screen} from '_tests/testUtils';
import {mockFormAttributeTree} from '__mocks__/common/attribute';
import {mockRecord} from '__mocks__/common/record';
import {mockTreeRecord, mockTreeRecordChild} from '__mocks__/common/treeElements';
import {mockRecordPropertyWithAttribute} from '__mocks__/common/value';
import {EditRecordReducerContext} from '../editRecordReducer/editRecordReducerContext';
import EditRecordSidebar from './EditRecordSidebar';

jest.mock('components/shared/RecordSummary', () => {
    return function RecordSummary() {
        return <div>RecordSummary</div>;
    };
});

describe('EditRecordSidebar', () => {
    const mockReducer = {state: {record: mockRecord, activeValue: null, sidebarCollapsed: false}, dispatch: jest.fn()};
    const mockReducerWithValue = {
        state: {
            ...mockReducer.state,
            record: mockRecord,
            activeValue: mockRecordPropertyWithAttribute
        },
        dispatch: jest.fn()
    };

    const mockReducerWithValueSimple = {
        state: {
            ...mockReducer.state,
            record: mockRecord,
            activeValue: {
                ...mockRecordPropertyWithAttribute,
                value: {...mockRecordPropertyWithAttribute.value, modified_at: null, modified_by: null}
            }
        },
        dispatch: jest.fn()
    };

    describe('Record summary', () => {
        test('Display record summary', async () => {
            await act(async () => {
                render(
                    <EditRecordReducerContext.Provider value={mockReducer}>
                        <EditRecordSidebar />
                    </EditRecordReducerContext.Provider>
                );
            });

            expect(screen.getByText('RecordSummary')).toBeInTheDocument();
        });
    });

    describe('Value details', () => {
        test('Display active value details', async () => {
            const {value, attribute} = mockReducerWithValue.state.activeValue;
            await act(async () => {
                render(
                    <EditRecordReducerContext.Provider value={mockReducerWithValue}>
                        <EditRecordSidebar />
                    </EditRecordReducerContext.Provider>
                );
            });

            expect(screen.getByText(attribute.id)).toBeInTheDocument();
            expect(screen.getByText(attribute.label.fr)).toBeInTheDocument();
            expect(screen.getByText(attribute.description.fr)).toBeInTheDocument();
            expect(screen.queryByText(/modified_at/)).toBeInTheDocument();
            expect(screen.getByText(new RegExp(value.modified_by.whoAmI.label))).toBeInTheDocument();
        });

        test("Don't display modifier if not set in value", async () => {
            await act(async () => {
                render(
                    <EditRecordReducerContext.Provider value={mockReducerWithValueSimple}>
                        <EditRecordSidebar />
                    </EditRecordReducerContext.Provider>
                );
            });

            expect(screen.queryByText(/modified_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/modified_by/)).not.toBeInTheDocument();
        });

        test('Display ancestors of tree value', async () => {
            const mockReducerWithTreeValue = {
                state: {
                    ...mockReducer.state,
                    activeValue: {
                        attribute: mockFormAttributeTree,
                        value: {
                            ...mockRecordPropertyWithAttribute.value,
                            treeValue: {
                                record: mockTreeRecord,
                                ancestors: [[{record: mockTreeRecordChild}, {record: mockTreeRecord}]]
                            }
                        }
                    }
                },
                dispatch: jest.fn()
            };
            await act(async () => {
                render(
                    <EditRecordReducerContext.Provider value={mockReducerWithTreeValue}>
                        <EditRecordSidebar />
                    </EditRecordReducerContext.Provider>
                );
            });

            const collapseBtn = screen.getByRole(/button/, {name: /path/});
            await act(async () => {
                collapseBtn.click();
            });

            expect(screen.getByText(mockTreeRecord.whoAmI.label)).toBeInTheDocument();
            expect(screen.getByText(mockTreeRecordChild.whoAmI.label)).toBeInTheDocument();
        });
    });
});
