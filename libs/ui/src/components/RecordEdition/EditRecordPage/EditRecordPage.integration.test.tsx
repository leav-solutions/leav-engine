// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {screen, render, waitFor} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {EditRecordPage} from './EditRecordPage';
import {
    mockFormElementInput,
    mockFormElementMultipleInput,
    mockFormElementRequiredInput,
    mockRecordForm,
    mockRecordFormWithValues
} from '_ui/__mocks__/common/form';
import {mockAttributeSimple, mockFormAttributeCompute} from '_ui/__mocks__/common/attribute';
import {APICallStatus} from '../EditRecordContent/_types';
import * as useGetRecordUpdatesSubscription from '_ui/hooks/useGetRecordUpdatesSubscription';
import {getUserDataQuery} from '_ui/_queries/userData/getUserData';
import * as gqlTypes from '_ui/_gqlTypes';
import {getLibraryByIdQuery} from '_ui/_queries/libraries/getLibraryByIdQuery';
import {mockLibraryWithDetails} from '_ui/__mocks__/common/library';

let user!: ReturnType<typeof userEvent.setup>;
const useGetRecordFormMock = jest.fn();
jest.mock('_ui/hooks/useGetRecordForm', () => () => useGetRecordFormMock());

jest.mock('_ui/hooks/useCanEditRecord', () => ({
    useCanEditRecord: () => ({loading: false, canEdit: true, isReadOnly: false})
}));

const createRecordMock = jest.fn();
jest.mock('_ui/components/RecordEdition/EditRecordContent/hooks/useCreateRecordMutation.ts', () => () => ({
    createRecord: createRecordMock
}));

const saveValuesMock = jest.fn();
jest.mock('_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation.ts', () => () => ({
    saveValues: saveValuesMock
}));

const deleteValueMock = jest.fn();
jest.mock('_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteDeleteValueMutation.ts', () => () => ({
    deleteValue: deleteValueMock
}));

const useGetRecordValuesQueryMock = jest.fn();
jest.mock('_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery', () => ({
    useGetRecordValuesQuery: () => useGetRecordValuesQueryMock()
}));

const refetchRecordFormWithValuesMock = jest.fn();
const useFetchVisibleFormValueMock = jest.fn().mockImplementation(() => ({
    recordFormWithValues: mockRecordFormWithValues,
    refetchRecordFormWithValues: refetchRecordFormWithValuesMock
}));

jest.mock('_ui/components/RecordEdition/EditRecordContent/hooks/useFetchVisibleFormValue', () => ({
    useFetchVisibleFormValue: () => useFetchVisibleFormValueMock()
}));

const useRunActionsListAndFormatOnValueMock = jest.fn(() => ({payload: 12}));
jest.mock('_ui/components/RecordEdition/EditRecordContent/hooks/useRunActionsListAndFormatOnValue.ts', () => ({
    useRunActionsListAndFormatOnValue: () => ({
        runActionsListAndFormatOnValue: useRunActionsListAndFormatOnValueMock
    })
}));

const mocks = [
    {
        request: {
            query: getUserDataQuery,
            variables: {keys: ['records_consultation_record_lib']}
        },
        result: {
            data: {
                userData: {
                    global: false,
                    data: []
                }
            }
        }
    },
    {
        request: {
            query: gqlTypes.SaveUserDataDocument,
            variables: {
                key: 'records_consultation_record_lib',
                value: ['123456'],
                global: false
            }
        },
        result: {
            data: {
                saveUserData: {
                    data: {
                        records_consultation_record_lib: ['123456']
                    },
                    global: false
                }
            }
        }
    },
    {
        request: {
            query: getLibraryByIdQuery,
            variables: {id: [mockRecord.library.id]}
        },
        result: {
            data: {
                libraries: {
                    __typename: 'LibrariesList',
                    totalCount: 0,
                    list: [
                        {
                            ...mockLibraryWithDetails,
                            id: mockRecord.library.id
                        }
                    ]
                }
            }
        }
    }
];

const useGetRecordUpdatesSubscriptionMock = jest.spyOn(
    useGetRecordUpdatesSubscription,
    'useGetRecordUpdatesSubscription'
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
        version: null
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
        version: null
    }
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
                    version: null
                }
            ]
        });

        useGetRecordUpdatesSubscriptionMock.mockReturnValue({
            loading: false
        });

        deleteValueMock.mockReset();
        useGetRecordFormMock.mockClear();

        useGetRecordValuesQueryMock.mockClear();
        useFetchVisibleFormValueMock.mockClear();
        refetchRecordFormWithValuesMock.mockClear();
    });

    afterEach(() => {
        saveValuesMock.mockClear();
    });

    test('Should render an input component', () => {
        useGetRecordFormMock.mockReturnValue({loading: false, recordForm: mockRecordForm, refetch: jest.fn()});
        useGetRecordValuesQueryMock.mockReturnValue({});
        render(<EditRecordPage library={mockRecord.library.id} onClose={jest.fn()} record={mockRecord} />, {mocks});

        expect(screen.getByPlaceholderText('record_edition.placeholder.enter_a_text'));
    });

    test('Should update calculated values on update of dependant field', async () => {
        const simpleElementInput = {
            ...mockFormElementInput,
            settings: [{key: 'label', value: {fr: 'simple attribute'}}]
        };

        const calculatedElementInput = {
            ...mockFormElementInput,
            id: 'input_calculated_element',
            attribute: mockFormAttributeCompute,
            values: calculatedValues('calculated'),
            settings: [{key: 'label', value: {fr: 'calculated attribute'}}]
        };

        useGetRecordFormMock.mockReturnValue({
            loading: false,
            recordForm: {...mockRecordForm, elements: [simpleElementInput, calculatedElementInput]},
            refetch: jest.fn()
        });

        useFetchVisibleFormValueMock.mockReturnValue({
            recordFormWithValues: {
                ...mockRecordForm,
                elements: [
                    {...simpleElementInput, values: mockRecordFormWithValues.elements[0].values, valueError: false},
                    {...calculatedElementInput, values: calculatedValues('updated calculated'), valueError: false}
                ]
            },
            refetchRecordFormWithValues: refetchRecordFormWithValuesMock
        });

        const refetchMock = jest.fn();
        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            data: {[mockRecord.id]: {[mockFormAttributeCompute.id]: calculatedValues('updated calculated')}},
            refetch: refetchMock
        });

        render(<EditRecordPage library={mockRecord.library.id} onClose={jest.fn()} record={mockRecord} />, {mocks});

        const calculatedInput = screen.getByRole('textbox', {name: 'calculated attribute'});
        const simpleInput = screen.getByRole('textbox', {name: 'simple attribute'});

        expect(screen.getAllByRole('textbox')).toHaveLength(2);
        expect(calculatedInput).toBeVisible();

        await user.click(simpleInput);
        await userEvent.type(simpleInput, 'some value');
        await userEvent.tab();

        expect(refetchRecordFormWithValuesMock).toHaveBeenCalledTimes(1);
        expect(calculatedInput).toHaveValue('updated calculated');
    });

    test('Should display error component if formula is in error and input when formula is working again', async () => {
        const simpleElementInput = {
            ...mockFormElementInput,
            settings: [{key: 'label', value: {fr: 'simple attribute'}}]
        };

        const calculatedElementInput = {
            ...mockFormElementInput,
            id: 'input_calculated_element',
            attribute: mockFormAttributeCompute,
            settings: [{key: 'label', value: {fr: 'calculated attribute'}}]
        };

        useGetRecordFormMock.mockReturnValue({
            loading: false,
            recordForm: {...mockRecordForm, elements: [simpleElementInput, calculatedElementInput]},
            refetch: jest.fn()
        });

        useFetchVisibleFormValueMock.mockReturnValue({
            recordFormWithValues: {
                ...mockRecordForm,
                elements: [
                    {...simpleElementInput, values: mockRecordFormWithValues.elements[0].values, valueError: false},
                    {...calculatedElementInput, values: null, valueError: true}
                ]
            },
            refetchRecordFormWithValues: refetchRecordFormWithValuesMock
        });

        render(<EditRecordPage library={mockRecord.library.id} onClose={jest.fn()} record={mockRecord} />, {mocks});

        const input = await screen.findAllByRole('textbox');

        // 1. Init record form
        expect(input).toHaveLength(1);
        expect(screen.queryByRole('textbox', {name: 'calculated attribute'})).not.toBeInTheDocument();

        // 2. getElementFormValues request is automatically triggered
        expect(input).toHaveLength(1);

        useFetchVisibleFormValueMock.mockReturnValue({
            recordFormWithValues: {
                ...mockRecordForm,
                elements: [
                    {...simpleElementInput, values: mockRecordFormWithValues.elements[0].values, valueError: false},
                    {
                        ...calculatedElementInput,
                        values: [{...mockRecordFormWithValues.elements[0].values, raw_payload: 'updated calculated'}],
                        valueError: false
                    }
                ]
            },
            refetchRecordFormWithValues: refetchRecordFormWithValuesMock
        });

        const simpleInput = await screen.findByRole('textbox', {name: 'simple attribute'});
        await user.click(simpleInput);
        await userEvent.type(simpleInput, 'some value');
        await userEvent.tab();
        await userEvent.click(document.body);

        expect(refetchRecordFormWithValuesMock).toHaveBeenCalledTimes(1);
        expect(screen.getAllByRole('textbox')).toHaveLength(2);
        expect(screen.getByRole('textbox', {name: 'calculated attribute'})).toBeInTheDocument();
        expect(screen.getByRole('textbox', {name: 'calculated attribute'})).toHaveValue('updated calculated');
    });

    describe('Field in error', () => {
        test('Should update the field in error if the text input is required and empty', async () => {
            const simpleElementInput = {
                ...mockFormElementRequiredInput,
                settings: [{key: 'label', value: {fr: 'simple attribute'}}]
            };

            useGetRecordFormMock.mockReturnValue({
                loading: false,
                recordForm: {...mockRecordForm, elements: [simpleElementInput]}
            });

            useFetchVisibleFormValueMock.mockReturnValue({
                recordFormWithValues: {
                    ...mockRecordForm,
                    elements: [
                        {...simpleElementInput, values: mockRecordFormWithValues.elements[0].values, valueError: false}
                    ]
                },
                refetchRecordFormWithValues: refetchRecordFormWithValuesMock
            });

            useGetRecordValuesQueryMock.mockReturnValue({
                loading: false,
                data: {},
                refetch: jest.fn()
            });

            deleteValueMock.mockReturnValue({
                status: 'ERROR',
                error: 'Attribute is required'
            });

            render(<EditRecordPage library={mockRecord.library.id} onClose={jest.fn()} record={mockRecord} />, {mocks});

            const simpleInput = await screen.findByRole('textbox');
            await user.click(simpleInput);
            await userEvent.type(simpleInput, 'some value');
            await userEvent.tab();
            expect(screen.queryByText('Attribute is required')).not.toBeInTheDocument();

            await userEvent.clear(simpleInput);
            await userEvent.tab();

            expect(screen.getByText('Attribute is required')).toBeVisible();
        });

        test('Should update the field in error if the multiple text input is required and empty', async () => {
            const simpleElementMultipleInput = {
                ...mockFormElementMultipleInput,
                settings: [{key: 'label', value: {fr: 'multiple attribute'}}]
            };

            useGetRecordFormMock.mockReturnValue({
                loading: false,
                recordForm: {...mockRecordForm, elements: [simpleElementMultipleInput]}
            });

            deleteValueMock.mockReturnValue({
                status: 'ERROR',
                error: 'Attribute is required'
            });

            render(
                <EditRecordPage
                    onCreate={createRecordMock}
                    library={mockRecord.library.id}
                    onClose={jest.fn()}
                    record={mockRecord}
                />,
                {mocks}
            );

            const multipleInput = await screen.findByRole('textbox');

            await user.click(multipleInput);
            expect(useGetRecordFormMock).toHaveBeenCalled();
            expect(useFetchVisibleFormValueMock).toHaveBeenCalled();

            await userEvent.clear(multipleInput);
            await userEvent.tab();

            expect(refetchRecordFormWithValuesMock).toHaveBeenCalled();
            expect(deleteValueMock).toHaveBeenCalled();
            expect(screen.getByText('Attribute is required')).toBeVisible();
        });
    });

    test('Should update sidebar when focus on an input', async () => {
        deleteValueMock.mockRestore();
        saveValuesMock.mockRestore();

        const simpleElementInput = {
            ...mockFormElementRequiredInput,
            settings: [{key: 'label', value: {fr: 'simple attribute'}}]
        };

        useGetRecordFormMock.mockReturnValue({
            loading: false,
            recordForm: {...mockRecordForm, elements: [simpleElementInput]},
            refetch: jest.fn()
        });

        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            data: null,
            refetch: jest.fn()
        });

        render(
            <EditRecordPage
                library={mockRecord.library.id}
                onClose={jest.fn()}
                showSidebar
                enableSidebar
                record={mockRecord}
            />,
            {mocks}
        );

        const textTypedByUser = ' and more text';

        const simpleInput = await screen.findByRole('textbox');
        expect(simpleInput).toBeVisible();
        expect(simpleInput).toHaveValue(mockRecordFormWithValues.elements[0].values[0].payload);
        await user.click(simpleInput);

        await userEvent.type(simpleInput, textTypedByUser);
        await userEvent.tab();

        expect(saveValuesMock).toHaveBeenCalled();
        expect(refetchRecordFormWithValuesMock).toHaveBeenCalledTimes(1);

        await user.click(simpleInput);
        expect(simpleInput).toHaveValue(mockRecordFormWithValues.elements[0].values[0].payload + textTypedByUser);
    });
});
