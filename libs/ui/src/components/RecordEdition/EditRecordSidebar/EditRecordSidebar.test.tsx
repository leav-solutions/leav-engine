// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {mockFormAttribute, mockFormAttributeTree} from '_ui/__mocks__/common/attribute';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockTreeRecord, mockTreeRecordChild} from '_ui/__mocks__/common/treeElements';
import {mockRecordPropertyWithAttribute} from '_ui/__mocks__/common/value';
import {render, screen} from '../../../_tests/testUtils';
import {initialState} from '../editRecordModalReducer/editRecordModalReducer';
import {
    EditRecordModalReducerContext,
    IEditRecordModalReducerContext
} from '../editRecordModalReducer/editRecordModalReducerContext';
import EditRecordSidebar from './EditRecordSidebar';

jest.mock('_ui/components/RecordEdition/EditRecordSidebar/RecordSummary', () => {
    return function RecordSummary() {
        return <div>RecordSummary</div>;
    };
});

jest.mock('_ui/components/RecordEdition/EditRecord/uiElements/StandardField', () => {
    return function StandardField() {
        return <div>StandardField</div>;
    };
});

describe('EditRecordSidebar', () => {
    const mockReducer: IEditRecordModalReducerContext = {
        state: {...initialState, record: mockRecord},
        dispatch: jest.fn()
    };
    const mockReducerWithValue: IEditRecordModalReducerContext = {
        ...mockReducer,
        state: {
            ...mockReducer.state,
            record: mockRecord,
            activeValue: mockRecordPropertyWithAttribute,
            sidebarContent: 'valueDetails'
        }
    };

    const mockReducerWithValueSimple: IEditRecordModalReducerContext = {
        ...mockReducerWithValue,
        state: {
            ...mockReducerWithValue.state,
            record: mockRecord,
            activeValue: {
                ...mockRecordPropertyWithAttribute,
                value: {...mockRecordPropertyWithAttribute.value, modified_at: null, modified_by: null}
            }
        }
    };

    const mockHandleMetadataSubmit = jest.fn();

    describe('Record summary', () => {
        test('Display record summary', async () => {
            render(
                <EditRecordModalReducerContext.Provider value={mockReducer}>
                    <EditRecordSidebar onMetadataSubmit={mockHandleMetadataSubmit} />
                </EditRecordModalReducerContext.Provider>
            );

            expect(screen.getByText('RecordSummary')).toBeInTheDocument();
        });
    });

    describe('Value details', () => {
        test('Display active value details', async () => {
            const {value, attribute} = mockReducerWithValue.state.activeValue;
            render(
                <EditRecordModalReducerContext.Provider value={mockReducerWithValue}>
                    <EditRecordSidebar onMetadataSubmit={mockHandleMetadataSubmit} />
                </EditRecordModalReducerContext.Provider>
            );

            expect(screen.queryByText(/created_at/)).toBeInTheDocument();
            expect(screen.queryByText(/modified_at/)).toBeInTheDocument();
            // user label should appear on created_by and modified_by
            expect(screen.getAllByText(new RegExp(value.modified_by.whoAmI.label))).toHaveLength(2);

            // Expand attribute section
            await userEvent.click(screen.getByRole('button', {name: /attribute/}));

            expect(await screen.findByText(attribute.id)).toBeInTheDocument();
            expect(screen.getByText(attribute.label.fr)).toBeInTheDocument();
            expect(screen.getByText(attribute.description.fr)).toBeInTheDocument();
        });

        test("Don't display modifier if not set in value", async () => {
            render(
                <EditRecordModalReducerContext.Provider value={mockReducerWithValueSimple}>
                    <EditRecordSidebar onMetadataSubmit={mockHandleMetadataSubmit} />
                </EditRecordModalReducerContext.Provider>
            );

            expect(screen.queryByText(/modified_at/)).not.toBeInTheDocument();
            expect(screen.queryByText(/modified_by/)).not.toBeInTheDocument();
        });

        test('Display ancestors of tree value', async () => {
            const mockReducerWithTreeValue = {
                ...mockReducerWithValue,
                state: {
                    ...mockReducerWithValue.state,
                    activeValue: {
                        attribute: mockFormAttributeTree,
                        value: {
                            ...mockRecordPropertyWithAttribute.value,
                            treeValue: {
                                id: '123456',
                                record: {...mockTreeRecord, whoAmI: {...mockTreeRecord.whoAmI, label: 'Tree record'}},
                                ancestors: [{record: mockTreeRecordChild}, {record: mockTreeRecord}]
                            }
                        }
                    }
                }
            };
            render(
                <EditRecordModalReducerContext.Provider value={mockReducerWithTreeValue}>
                    <EditRecordSidebar onMetadataSubmit={mockHandleMetadataSubmit} />
                </EditRecordModalReducerContext.Provider>
            );

            const collapseBtn = screen.getByRole('button', {name: /path/});
            await userEvent.click(collapseBtn);

            expect(screen.getByText('Tree record')).toBeInTheDocument();
            expect(screen.getByText(mockTreeRecordChild.whoAmI.label)).toBeInTheDocument();
        });

        test('Display metadata of the value', async () => {
            const mockReducerWithValueAndMetadata = {
                ...mockReducerWithValue,
                state: {
                    ...mockReducerWithValue.state,
                    activeValue: {
                        ...mockReducerWithValue.state.activeValue,
                        attribute: {
                            ...mockReducerWithValue.state.activeValue.attribute,
                            metadata_fields: [{...mockFormAttribute, values_list: null}]
                        }
                    }
                }
            };

            render(
                <EditRecordModalReducerContext.Provider value={mockReducerWithValueAndMetadata}>
                    <EditRecordSidebar onMetadataSubmit={mockHandleMetadataSubmit} />
                </EditRecordModalReducerContext.Provider>
            );

            expect(screen.getByText(/metadata/)).toBeInTheDocument();
            expect(screen.getByText(/StandardField/)).toBeInTheDocument();
        });
    });
});
