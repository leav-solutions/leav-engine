import userEvent from '@testing-library/user-event';
import {screen, render, waitFor} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {EditRecordPage} from './EditRecordPage';
import {
    mockFormElementInput,
    mockFormElementMultipleInput,
    mockFormElementRequiredInput,
    mockRecordForm,
} from '_ui/__mocks__/common/form';
import {mockAttributeSimple, mockFormAttributeCompute} from '_ui/__mocks__/common/attribute';
import {APICallStatus} from '../EditRecordContent/_types';
import * as useGetRecordUpdatesSubscription from '_ui/hooks/useGetRecordUpdatesSubscription';
import {getUserDataQuery} from '_ui/_queries/userData/getUserData';
import * as gqlTypes from '_ui/_gqlTypes';
import {getLibraryByIdQuery} from '_ui/_queries/libraries/getLibraryByIdQuery';
import {mockLibraryWithDetails} from '_ui/__mocks__/common/library';

let user!: ReturnType<typeof userEvent.setup>;
// vi.hoisted is required because vi.mock factories are hoisted above these declarations.
const {useGetRecordFormMock, saveValuesMock, deleteValueMock, useGetRecordValuesQueryMock} = vi.hoisted(() => ({
    useGetRecordFormMock: vi.fn(),
    saveValuesMock: vi.fn(),
    deleteValueMock: vi.fn(),
    useGetRecordValuesQueryMock: vi.fn(),
}));
vi.mock('_ui/hooks/useGetRecordForm', () => ({default: () => useGetRecordFormMock()}));

vi.mock('_ui/hooks/useCanEditRecord', () => ({
    useCanEditRecord: () => ({loading: false, canEdit: true, isReadOnly: false}),
}));

vi.mock('_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation.ts', () => ({
    default: () => ({
        saveValues: saveValuesMock,
    }),
}));

vi.mock('_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteDeleteValueMutation.ts', () => ({
    default: () => ({
        deleteValue: deleteValueMock,
    }),
}));

vi.mock('_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery', () => ({
    useGetRecordValuesQuery: () => useGetRecordValuesQueryMock(),
}));

vi.mock('_ui/components/RecordHistory/hooks/useFetchRecordHistory', () => ({
    useFetchRecordHistory: () => ({
        loading: false,
        inError: false,
        logs: [],
        total: 0,
        hasMore: false,
        fetchMore: vi.fn(),
    }),
}));

vi.spyOn(gqlTypes, 'useGetRecordIdCardQuery').mockReturnValue({
    data: undefined,
    loading: false,
    refetch: vi.fn(),
} as unknown as gqlTypes.GetRecordIdCardQueryResult);

const mocks = [
    {
        request: {
            query: getUserDataQuery,
            variables: {keys: ['records_consultation_record_lib']},
        },
        result: {
            data: {
                userData: {
                    global: false,
                    data: [],
                },
            },
        },
    },
    {
        request: {
            query: gqlTypes.SaveUserDataDocument,
            variables: {
                key: 'records_consultation_record_lib',
                value: ['123456'],
                global: false,
            },
        },
        result: {
            data: {
                saveUserData: {
                    data: {
                        records_consultation_record_lib: ['123456'],
                    },
                    global: false,
                },
            },
        },
    },
    {
        request: {
            query: getLibraryByIdQuery,
            variables: {id: [mockRecord.library.id]},
        },
        result: {
            data: {
                libraries: {
                    __typename: 'LibrariesList',
                    totalCount: 0,
                    list: [
                        {
                            ...mockLibraryWithDetails,
                            id: mockRecord.library.id,
                        },
                    ],
                },
            },
        },
    },
];

const useGetRecordUpdatesSubscriptionMock = vi.spyOn(
    useGetRecordUpdatesSubscription,
    'useGetRecordUpdatesSubscription',
);

const calculatedValues = (value: string) => [
    {
        isCalculated: false,
        payload: null,
        raw_payload: null,
        created_at: 123456789,
        modified_at: 123456789,
        id_value: null,
        attribute: mockAttributeSimple,
        metadata: null,
        version: null,
    },
    {
        isCalculated: true,
        payload: value,
        raw_payload: value,
        created_at: 123456789,
        modified_at: 123456789,
        id_value: null,
        attribute: mockAttributeSimple,
        metadata: null,
        version: null,
    },
];

describe('EditRecordPage', () => {
    beforeEach(() => {
        user = userEvent.setup();
        saveValuesMock.mockReturnValue({
            status: APICallStatus.SUCCESS,
            values: [
                {
                    isCalculated: false,
                    payload: 'some value',
                    raw_payload: 'some value',
                    created_at: 123456789,
                    modified_at: 123456789,
                    id_value: 'id_value',
                    attribute: mockAttributeSimple,
                    metadata: null,
                    version: null,
                },
            ],
        });
        deleteValueMock.mockClear();
        useGetRecordFormMock.mockClear();
        useGetRecordValuesQueryMock.mockClear();
        useGetRecordUpdatesSubscriptionMock.mockReturnValue({
            loading: false,
            restart: vi.fn(),
        });
    });

    afterEach(() => {
        saveValuesMock.mockClear();
    });

    test('Should render an input component', () => {
        useGetRecordFormMock.mockReturnValue({loading: false, recordForm: mockRecordForm, refetch: vi.fn()});
        useGetRecordValuesQueryMock.mockReturnValue({});
        render(<EditRecordPage library={mockRecord.library.id} onClose={vi.fn()} record={mockRecord} />, {mocks});

        expect(screen.getByPlaceholderText('record_edition.placeholder.enter_a_text'));
    });

    test('Should update calculated values on update of dependant field', async () => {
        const simpleElementInput = {
            ...mockFormElementInput,
            settings: [{key: 'label', value: {fr: 'simple attribute'}}],
        };

        const calculatedElementInput = {
            ...mockFormElementInput,
            id: 'input_calculated_element',
            attribute: mockFormAttributeCompute,
            values: calculatedValues('calculated'),
            settings: [{key: 'label', value: {fr: 'calculated attribute'}}],
        };

        useGetRecordFormMock.mockReturnValue({
            loading: false,
            recordForm: {...mockRecordForm, elements: [simpleElementInput, calculatedElementInput]},
            refetch: vi.fn(),
        });

        const refetchMock = vi.fn();
        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            data: {[mockRecord.id]: {[mockFormAttributeCompute.id]: calculatedValues('updated calculated')}},
            refetch: refetchMock,
        });

        render(<EditRecordPage library={mockRecord.library.id} onClose={vi.fn()} record={mockRecord} />, {mocks});

        const calculatedInput = screen.getByRole('textbox', {name: 'calculated attribute'});
        const simpleInput = screen.getByRole('textbox', {name: 'simple attribute'});

        expect(screen.getAllByRole('textbox')).toHaveLength(2);
        expect(calculatedInput).toBeVisible();

        await user.click(simpleInput);
        await userEvent.type(simpleInput, 'some value');
        await userEvent.tab();

        expect(refetchMock).toHaveBeenCalledTimes(1);
        expect(calculatedInput).toHaveValue('updated calculated');
    });

    test('Should display error component if formula is in error and input when formula is working again', async () => {
        const simpleElementInput = {
            ...mockFormElementInput,
            settings: [{key: 'label', value: {fr: 'simple attribute'}}],
        };

        const calculatedElementInput = {
            ...mockFormElementInput,
            id: 'input_calculated_element',
            attribute: mockFormAttributeCompute,
            values: calculatedValues('calculated'),
            settings: [{key: 'label', value: {fr: 'calculated attribute'}}],
            valueError: true,
        };

        useGetRecordFormMock.mockReturnValue({
            loading: false,
            recordForm: {...mockRecordForm, elements: [simpleElementInput, calculatedElementInput]},
            refetch: vi.fn(),
        });

        const refetchMock = vi.fn();
        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            data: null,
            refetch: refetchMock,
        });

        render(<EditRecordPage library={mockRecord.library.id} onClose={vi.fn()} record={mockRecord} />, {mocks});

        expect(screen.getAllByRole('textbox')).toHaveLength(1);
        expect(screen.queryByRole('textbox', {name: 'calculated attribute'})).not.toBeInTheDocument();

        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            data: {[mockRecord.id]: {[mockFormAttributeCompute.id]: calculatedValues('updated calculated')}},
            refetch: refetchMock,
        });

        const simpleInput = screen.getByRole('textbox', {name: 'simple attribute'});
        await user.click(simpleInput);
        await userEvent.type(simpleInput, 'some value');
        await userEvent.tab();
        await userEvent.click(document.body);

        expect(refetchMock).toHaveBeenCalledTimes(1);
        expect(screen.getAllByRole('textbox')).toHaveLength(2);
    });

    describe('Field in error', () => {
        test('Should update the field in error if the text input is required and empty', async () => {
            const simpleElementInput = {
                ...mockFormElementRequiredInput,
                settings: [{key: 'label', value: {fr: 'simple attribute'}}],
            };

            useGetRecordFormMock.mockReturnValue({
                loading: false,
                recordForm: {...mockRecordForm, elements: [simpleElementInput]},
            });

            useGetRecordValuesQueryMock.mockReturnValue({
                loading: false,
                data: {},
                refetch: vi.fn(),
            });

            deleteValueMock.mockReturnValue({
                status: 'ERROR',
                error: 'Attribute is required',
            });

            render(<EditRecordPage library={mockRecord.library.id} onClose={vi.fn()} record={mockRecord} />, {mocks});

            const simpleInput = screen.getByRole('textbox', {name: 'simple attribute'});

            await user.click(simpleInput);
            await userEvent.type(simpleInput, 'some value');
            await userEvent.tab();
            expect(screen.queryByText('Attribute is required')).not.toBeInTheDocument();

            await userEvent.clear(simpleInput);
            await userEvent.tab();

            expect(screen.getByText('Attribute is required')).toBeVisible();
        });

        // TODO : modify this test when backend validation is done on creation
        test.skip('Should update the field in error if the multiple text input is required and empty', async () => {
            const simpleElementMultipleInput = {
                ...mockFormElementMultipleInput,
                settings: [{key: 'label', value: {fr: 'multiple attribute'}}],
            };

            useGetRecordFormMock.mockReturnValue({
                loading: false,
                recordForm: {...mockRecordForm, elements: [simpleElementMultipleInput]},
            });

            useGetRecordValuesQueryMock.mockReturnValue({
                loading: false,
                data: {},
                refetch: vi.fn(),
            });

            // createRecordMock.mockReturnValue({
            //     status: APICallStatus.ERROR,
            //     errors: [
            //         {
            //             attribute: 'test_attribute',
            //             input: null,
            //             message: 'Attribute is required',
            //             type: 'REQUIRED_ATTRIBUTE'
            //         }
            //     ]
            // });

            render(
                <EditRecordPage onCreate={vi.fn()} library={mockRecord.library.id} onClose={vi.fn()} record={null} />,
                {mocks},
            );

            const multipleInput = screen.getByRole('textbox', {name: 'multiple attribute'});

            await user.click(multipleInput);
            await userEvent.type(multipleInput, 'some value');
            await userEvent.click(screen.getByText('record_edition.create'));
            expect(screen.getByText('Attribute is required')).toBeVisible();
        });
    });

    test('Should update sidebar when focus on an input', async () => {
        const simpleElementInput = {
            ...mockFormElementRequiredInput,
            settings: [{key: 'label', value: {fr: 'simple attribute'}}],
        };

        useGetRecordFormMock.mockReturnValue({
            loading: false,
            recordForm: {...mockRecordForm, elements: [simpleElementInput]},
        });

        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            data: null,
            refetch: vi.fn(),
        });

        render(
            <EditRecordPage
                library={mockRecord.library.id}
                onClose={vi.fn()}
                showSidebar
                enableSidebar
                record={mockRecord}
            />,
            {
                mocks,
            },
        );

        const simpleInput = screen.getByRole('textbox', {name: 'simple attribute'});

        await user.click(simpleInput);
        await userEvent.type(simpleInput, 'some value');
        await userEvent.tab();

        waitFor(() => {
            expect(screen.queryByText('some value')).not.toBeInTheDocument();
            expect(saveValuesMock).toHaveBeenCalled();
        });

        await user.click(simpleInput);

        expect(screen.getByText('some value')).toBeVisible();
    });
});
