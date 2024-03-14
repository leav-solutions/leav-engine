import {render, screen, waitFor} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import StandardField from './StandardField';
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
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';

describe('StandardField, Color input', () => {
    const mockRecordValuesCommon = {
        created_at: 123456789,
        modified_at: 123456789,
        created_by: mockModifier,
        modified_by: mockModifier,
        id_value: null,
        metadata: null,
        version: null
    };

    const mockAttribute: IRecordPropertyAttribute = {
        id: 'test_attribute',
        label: {en: 'Test Attribute'},
        format: AttributeFormat.color,
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
    test('Render color field', async () => {
        const colorValue = 'FFFFFF';
        const newColorValue = '000000';
        const recordValuesDate = [
            {
                ...mockRecordValuesCommon,
                value: colorValue,
                raw_value: colorValue
            }
        ];
        render(
            <StandardField
                element={{
                    ...mockFormElementInput,
                    attribute: {...mockFormAttribute, format: AttributeFormat.color},
                    values: recordValuesDate
                }}
                {...baseProps}
            />
        );
        // Open ColorPicker Element
        const colorElem = screen.getByRole('textbox');
        userEvent.click(colorElem);

        const colorPickerElem = screen.getByRole('textbox');
        expect(colorPickerElem).toBeInTheDocument();

        // Update color value
        colorPickerElem.focus();
        await userEvent.clear(colorPickerElem);
        await userEvent.type(colorPickerElem, newColorValue);
        await userEvent.click(screen.getByRole('button', {name: 'global.submit'}));

        expect(colorPickerElem).not.toBeInTheDocument();
        expect(mockHandleSubmit).toHaveBeenCalled();
    });
});
