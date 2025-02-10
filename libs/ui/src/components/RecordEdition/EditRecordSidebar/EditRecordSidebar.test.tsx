// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {mockFormAttribute, mockFormAttributeTree} from '_ui/__mocks__/common/attribute';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockTreeRecord, mockTreeRecordChild} from '_ui/__mocks__/common/treeElements';
import {mockRecordPropertyWithAttribute} from '_ui/__mocks__/common/value';
import {render, screen} from '../../../_tests/testUtils';
import {initialState} from '../editRecordReducer/editRecordReducer';
import {EditRecordReducerContext, IEditRecordReducerContext} from '../editRecordReducer/editRecordReducerContext';
import EditRecordSidebar from './EditRecordSidebar';
import {IUseGetRecordColumnsValuesQueryHook} from '_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';

jest.mock('_ui/components/RecordEdition/EditRecordSidebar/RecordSummary/RecordInformations/RecordInformations', () => ({
    RecordInformations: () => <div>Informations</div>
}));

jest.mock('_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery', () => ({
    useGetRecordValuesQuery: (): Partial<IUseGetRecordColumnsValuesQueryHook> => ({
        loading: false,
        data: {},
        refetch: jest.fn()
    })
}));

jest.mock(
    '_ui/components/RecordEdition/EditRecordContent/uiElements/StandardField',
    () =>
        function StandardField() {
            return <div>StandardField</div>;
        }
);

describe('EditRecordSidebar', () => {
    const mockReducer: IEditRecordReducerContext = {
        state: {...initialState, record: mockRecord},
        dispatch: jest.fn()
    };
    const mockReducerWithValue: IEditRecordReducerContext = {
        ...mockReducer,
        state: {
            ...mockReducer.state,
            record: mockRecord,
            activeAttribute: mockRecordPropertyWithAttribute,
            sidebarContent: 'valueDetails'
        }
    };

    const mockReducerWithoutValue: IEditRecordReducerContext = {
        ...mockReducer,
        state: {
            ...mockReducer.state,
            record: mockRecord,
            sidebarContent: 'none'
        }
    };

    const mockReducerWithValueSimple: IEditRecordReducerContext = {
        ...mockReducerWithValue,
        state: {
            ...mockReducerWithValue.state,
            record: mockRecord,
            activeAttribute: {
                ...mockRecordPropertyWithAttribute,
                attribute: mockRecordPropertyWithAttribute.attribute
            }
        }
    };

    const mockHandleMetadataSubmit = jest.fn();

    it("shouldn't display sidebar content if none", async () => {
        render(
            <EditRecordReducerContext.Provider value={mockReducerWithoutValue}>
                <EditRecordSidebar onMetadataSubmit={mockHandleMetadataSubmit} open />
            </EditRecordReducerContext.Provider>
        );

        expect(screen.queryByText(/Informations/)).not.toBeInTheDocument();
    });

    it('should display sidebar content in portal if sidebarContainer is provided', async () => {
        const sidebarContainer = document.createElement('div');
        document.body.appendChild(sidebarContainer);

        render(
            <EditRecordReducerContext.Provider value={mockReducer}>
                <EditRecordSidebar
                    onMetadataSubmit={mockHandleMetadataSubmit}
                    sidebarContainer={sidebarContainer}
                    open
                />
            </EditRecordReducerContext.Provider>
        );

        expect(screen.getByText('Informations')).toBeInTheDocument();
    });

    describe('Record summary', () => {
        it('should display record summary', async () => {
            render(
                <EditRecordReducerContext.Provider value={mockReducer}>
                    <EditRecordSidebar onMetadataSubmit={mockHandleMetadataSubmit} open />
                </EditRecordReducerContext.Provider>
            );

            expect(screen.getByText('Informations')).toBeInTheDocument();
            expect(screen.getByText('record_label')).toBeInTheDocument();
        });

        it('should display record summary with new record', async () => {
            const mockReducerWithoutRecord = {
                ...mockReducer,
                state: {...mockReducer.state, record: null}
            };

            render(
                <EditRecordReducerContext.Provider value={mockReducerWithoutRecord}>
                    <EditRecordSidebar onMetadataSubmit={mockHandleMetadataSubmit} open />
                </EditRecordReducerContext.Provider>
            );

            expect(screen.getByText('Informations')).toBeInTheDocument();
            expect(screen.getByText(/new_record/)).toBeInTheDocument();
        });
    });

    describe('Value details', () => {
        test('Display active value details', async () => {
            const {attribute} = mockReducerWithValue.state.activeAttribute;
            render(
                <EditRecordReducerContext.Provider value={mockReducerWithValueSimple}>
                    <EditRecordSidebar onMetadataSubmit={mockHandleMetadataSubmit} open />
                </EditRecordReducerContext.Provider>
            );

            expect(screen.getByText(attribute.format)).toBeInTheDocument();
            expect(screen.getByText(attribute.description.fr)).toBeInTheDocument();
        });
    });
});
