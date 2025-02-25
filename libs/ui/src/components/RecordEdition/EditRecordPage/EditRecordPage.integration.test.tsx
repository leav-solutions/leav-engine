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
    mockRecordForm
} from '_ui/__mocks__/common/form';
import {mockAttributeSimple, mockFormAttributeCompute} from '_ui/__mocks__/common/attribute';
import {APICallStatus} from '../EditRecordContent/_types';

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

const useRunActionsListAndFormatOnValueMock = jest.fn(() => ({payload: 12}));
jest.mock('_ui/components/RecordEdition/EditRecordContent/hooks/useRunActionsListAndFormatOnValue.ts', () => ({
    useRunActionsListAndFormatOnValue: () => ({
        runActionsListAndFormatOnValue: useRunActionsListAndFormatOnValueMock
    })
}));

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
        deleteValueMock.mockClear();
        useGetRecordFormMock.mockClear();
        useGetRecordValuesQueryMock.mockClear();
    });

    afterEach(() => {
        saveValuesMock.mockClear();
    });

    test('Should render an input component', () => {
        useGetRecordFormMock.mockReturnValue({loading: false, recordForm: mockRecordForm, refetch: jest.fn()});
        useGetRecordValuesQueryMock.mockReturnValue({});
        render(<EditRecordPage library={mockRecord.library.id} onClose={jest.fn()} record={mockRecord} />);

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

        const refetchMock = jest.fn();
        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            data: {[mockRecord.id]: {[mockFormAttributeCompute.id]: calculatedValues('updated calculated')}},
            refetch: refetchMock
        });

        render(<EditRecordPage library={mockRecord.library.id} onClose={jest.fn()} record={mockRecord} />);

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
            settings: [{key: 'label', value: {fr: 'simple attribute'}}]
        };

        const calculatedElementInput = {
            ...mockFormElementInput,
            id: 'input_calculated_element',
            attribute: mockFormAttributeCompute,
            values: calculatedValues('calculated'),
            settings: [{key: 'label', value: {fr: 'calculated attribute'}}],
            valueError: true
        };

        useGetRecordFormMock.mockReturnValue({
            loading: false,
            recordForm: {...mockRecordForm, elements: [simpleElementInput, calculatedElementInput]},
            refetch: jest.fn()
        });

        const refetchMock = jest.fn();
        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            data: null,
            refetch: refetchMock
        });

        render(<EditRecordPage library={mockRecord.library.id} onClose={jest.fn()} record={mockRecord} />);

        expect(screen.getAllByRole('textbox')).toHaveLength(1);
        expect(screen.queryByRole('textbox', {name: 'calculated attribute'})).not.toBeInTheDocument();

        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            data: {[mockRecord.id]: {[mockFormAttributeCompute.id]: calculatedValues('updated calculated')}},
            refetch: refetchMock
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
                settings: [{key: 'label', value: {fr: 'simple attribute'}}]
            };

            useGetRecordFormMock.mockReturnValue({
                loading: false,
                recordForm: {...mockRecordForm, elements: [simpleElementInput]}
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

            render(<EditRecordPage library={mockRecord.library.id} onClose={jest.fn()} record={mockRecord} />);

            const simpleInput = screen.getByRole('textbox', {name: 'simple attribute'});

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

            useGetRecordValuesQueryMock.mockReturnValue({
                loading: false,
                data: {},
                refetch: jest.fn()
            });

            createRecordMock.mockReturnValue({
                status: APICallStatus.ERROR,
                errors: [
                    {
                        attribute: 'test_attribute',
                        input: null,
                        message: 'Attribute is required',
                        type: 'REQUIRED_ATTRIBUTE'
                    }
                ]
            });

            render(
                <EditRecordPage
                    onCreate={createRecordMock}
                    library={mockRecord.library.id}
                    onClose={jest.fn()}
                    record={null}
                />
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
            settings: [{key: 'label', value: {fr: 'simple attribute'}}]
        };

        useGetRecordFormMock.mockReturnValue({
            loading: false,
            recordForm: {...mockRecordForm, elements: [simpleElementInput]}
        });

        useGetRecordValuesQueryMock.mockReturnValue({
            loading: false,
            data: null,
            refetch: jest.fn()
        });

        render(<EditRecordPage library={mockRecord.library.id} onClose={jest.fn()} showSidebar record={mockRecord} />);

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
