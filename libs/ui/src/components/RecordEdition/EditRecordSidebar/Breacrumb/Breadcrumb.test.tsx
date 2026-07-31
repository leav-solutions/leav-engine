import userEvent from '@testing-library/user-event';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockRecordPropertyWithAttribute} from '_ui/__mocks__/common/value';
import Breadcrumb from './Breadcrumb';
import {
    EditRecordReducerActionsTypes,
    EditRecordSidebarContentTypeMap,
    initialState,
} from '../../editRecordReducer/editRecordReducer';
import {
    EditRecordReducerContext,
    type IEditRecordReducerContext,
} from '../../editRecordReducer/editRecordReducerContext';
import {render, screen} from '../../../../_tests/testUtils';

describe('Breadcrumb', () => {
    const dispatchMock = vi.fn();

    const mockReducer: IEditRecordReducerContext = {
        state: {...initialState, record: mockRecord},
        dispatch: dispatchMock,
    };
    const mockReducerWithValue: IEditRecordReducerContext = {
        ...mockReducer,
        state: {
            ...mockReducer.state,
            record: mockRecord,
            activeAttribute: mockRecordPropertyWithAttribute,
            sidebarContent: EditRecordSidebarContentTypeMap.VALUE_DETAILS,
        },
    };

    const mockReducerWithoutValue: IEditRecordReducerContext = {
        ...mockReducer,
        state: {
            ...mockReducer.state,
            record: mockRecord,
            sidebarContent: EditRecordSidebarContentTypeMap.NONE,
        },
    };

    const mockReducerWithSummary: IEditRecordReducerContext = {
        ...mockReducer,
        state: {
            ...mockReducer.state,
            record: mockRecord,
            sidebarContent: EditRecordSidebarContentTypeMap.SUMMARY,
        },
    };

    it('should not display breadcrumb without sidebarContent', async () => {
        render(
            <EditRecordReducerContext.Provider value={mockReducerWithoutValue}>
                <Breadcrumb />
            </EditRecordReducerContext.Provider>,
        );

        expect(screen.queryByLabelText(/record_summary.entity_overview|Test Lib/)).not.toBeInTheDocument();
    });

    describe('sidebarContent is valueDetails', () => {
        it('should display two levels breadcrumb', async () => {
            render(
                <EditRecordReducerContext.Provider value={mockReducerWithValue}>
                    <Breadcrumb />
                </EditRecordReducerContext.Provider>,
            );

            expect(screen.getByLabelText(/record_summary.entity_overview|Test Lib/)).toBeVisible();
            expect(screen.queryByLabelText(/record_summary.attribute/)).toBeVisible();
        });

        it('should set sidebarContent to summary on click on first level', async () => {
            render(
                <EditRecordReducerContext.Provider value={mockReducerWithValue}>
                    <Breadcrumb />
                </EditRecordReducerContext.Provider>,
            );

            await userEvent.click(screen.getByLabelText(/record_summary.entity_overview|Test Lib/));
            expect(dispatchMock).toHaveBeenCalledWith({
                type: EditRecordReducerActionsTypes.SET_SIDEBAR_CONTENT,
                content: 'summary',
            });
        });
    });

    describe('sidebarContent is valueDetails', () => {
        it('should display one level breadcrumb', async () => {
            render(
                <EditRecordReducerContext.Provider value={mockReducerWithSummary}>
                    <Breadcrumb />
                </EditRecordReducerContext.Provider>,
            );

            expect(screen.getByLabelText(/record_summary.entity_overview|Test Lib/)).toBeVisible();
            expect(screen.queryByLabelText(/record_summary.attribute/)).not.toBeInTheDocument();
        });
    });
});
