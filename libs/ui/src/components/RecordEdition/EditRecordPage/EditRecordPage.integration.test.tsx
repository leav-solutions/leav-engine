// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {screen, render} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {EditRecordPage} from './EditRecordPage';
import {mockFormElementInput, mockRecordForm} from '_ui/__mocks__/common/form';
import {mockAttributeSimple, mockFormAttributeCompute} from '_ui/__mocks__/common/attribute';

let user!: ReturnType<typeof userEvent.setup>;
const useGetRecordFormMock = jest.fn();
jest.mock('_ui/hooks/useGetRecordForm', () => () => useGetRecordFormMock());

jest.mock('_ui/hooks/useCanEditRecord', () => ({
    useCanEditRecord: () => ({loading: false, canEdit: true, isReadOnly: false})
}));

const useGetRecordValuesQueryMock = jest.fn();
jest.mock('_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery', () => ({
    useGetRecordValuesQuery: () => useGetRecordValuesQueryMock()
}));

describe('EditRecordPage', () => {
    beforeEach(() => {
        user = userEvent.setup();
        useGetRecordFormMock.mockClear();
        useGetRecordValuesQueryMock.mockClear();
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

        expect(refetchMock).toHaveBeenCalledTimes(1);
        expect(screen.getAllByRole('textbox')).toHaveLength(2);
    });
});
