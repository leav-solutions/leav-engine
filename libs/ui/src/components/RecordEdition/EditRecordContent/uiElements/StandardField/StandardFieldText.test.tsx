import {render, screen, waitFor} from '_ui/_tests/testUtils';
import StandardField from './StandardField';
import userEvent from '@testing-library/user-event';
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import {
    APICallStatus,
    DeleteMultipleValuesFunc,
    DeleteValueFunc,
    ISubmitMultipleResult,
    SubmitValueFunc
} from '../../_types';
import {mockModifier} from '_ui/__mocks__/common/value';
import {AttributeFormat, AttributeType, ValueDetailsValueFragment} from '_ui/_gqlTypes';
import {IRecordPropertyAttribute} from '_ui/_queries/records/getRecordPropertiesQuery';

describe('StandardField, Text input', () => {
    const mockAttribute: IRecordPropertyAttribute = {
        id: 'test_attribute',
        label: {en: 'Test Attribute'},
        format: AttributeFormat.text,
        type: AttributeType.simple,
        system: false
    };

    const mockSubmitRes: ISubmitMultipleResult = {
        status: APICallStatus.SUCCESS,
        values: [
            {
                id_value: null,
                created_at: 1234567890,
                created_by: {
                    ...mockModifier
                },
                modified_at: 1234567890,
                modified_by: {
                    ...mockModifier
                },
                value: 'new value',
                raw_value: 'new raw value',
                version: null,
                attribute: mockAttribute as ValueDetailsValueFragment['attribute'],
                metadata: null
            }
        ]
    };

    const mockHandleSubmit: SubmitValueFunc = jest.fn().mockReturnValue(mockSubmitRes);
    const mockHandleDelete: DeleteValueFunc = jest.fn().mockReturnValue({status: APICallStatus.SUCCESS});
    const mockHandleMultipleValues: DeleteMultipleValuesFunc = jest
        .fn()
        .mockReturnValue({status: APICallStatus.SUCCESS});

    const baseProps = {
        onValueSubmit: mockHandleSubmit,
        onValueDelete: mockHandleDelete,
        onDeleteMultipleValues: mockHandleMultipleValues
    };

    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    test('Render text field, type value and submit', async () => {
        render(<StandardField element={mockFormElementInput} {...baseProps} />);

        const inputElem = screen.getByRole('textbox');
        expect(inputElem).toBeInTheDocument();
        expect(inputElem).toHaveValue('My value formatted');

        await userEvent.click(inputElem);

        // When editing, input is a new component, thus we have to get it again
        const editingInputElem = screen.getByRole('textbox');
        await waitFor(() => {
            expect(editingInputElem).toHaveValue('my_raw_value');
        });

        const submitBtn = screen.getByRole('button', {name: 'global.submit'});
        expect(submitBtn).toBeVisible();

        await userEvent.clear(editingInputElem);
        await userEvent.type(editingInputElem, 'value modified');
        await waitFor(() => {
            expect(editingInputElem).toHaveValue('value modified');
        });

        userEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockHandleSubmit).toHaveBeenCalled();
        });
    });
});
