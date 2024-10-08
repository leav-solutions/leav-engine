// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import StandardField from '../StandardField';
import {mockModifier} from '_ui/__mocks__/common/value';
import {AttributeFormat, AttributeType, ValueDetailsValueFragment} from '_ui/_gqlTypes';
import {IRecordPropertyAttribute} from '_ui/_queries/records/getRecordPropertiesQuery';
import {mockFormElementContainer, mockFormElementInput} from '_ui/__mocks__/common/form';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {
    APICallStatus,
    DeleteMultipleValuesFunc,
    DeleteValueFunc,
    ISubmitMultipleResult,
    SubmitValueFunc
} from '../../_types';
import {AntForm} from 'aristid-ds';
import {getAntdFormInitialValues} from '../../antdUtils';
import {IRecordForm} from '_ui/hooks/useGetRecordForm';

describe('StandardField, Numeric input', () => {
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

    test('Render numeric input', async () => {
        const recordValuesNumeric = [
            {
                ...mockRecordValuesCommon,
                payload: '42,00 €',
                raw_payload: '42'
            }
        ];

        const recordForm: IRecordForm = {
            dependencyAttributes: [],
            elements: [
                {
                    ...mockFormElementContainer,
                    settings: [{key: 'content', value: ''}]
                },
                {
                    ...mockFormElementInput,
                    settings: [
                        {key: 'label', value: 'test attribute'},
                        {key: 'attribute', value: 'test_attribute'}
                    ],
                    attribute: {...mockFormAttribute, format: AttributeFormat.numeric},
                    values: recordValuesNumeric
                }
            ],
            id: 'edition',
            recordId: 'recordId',
            library: {id: 'libraryId'}
        };

        const antdFormInitialValues = getAntdFormInitialValues(recordForm);

        render(
            <AntForm initialValues={antdFormInitialValues}>
                <AntForm.Item>
                    <StandardField
                        element={{
                            ...mockFormElementInput,
                            attribute: {...mockFormAttribute, format: AttributeFormat.numeric},
                            values: recordValuesNumeric
                        }}
                        {...baseProps}
                    />
                </AntForm.Item>
            </AntForm>
        );

        const formattedValueElem = screen.getByText(recordValuesNumeric[0].payload);
        expect(formattedValueElem).toBeVisible();

        expect(screen.queryByRole('spinbutton')).toBeNull();

        await userEvent.click(formattedValueElem);

        const inputElem = screen.getByRole('spinbutton');
        expect(inputElem).toBeVisible();
        expect(inputElem).toHaveValue(recordValuesNumeric[0].raw_payload);

        expect(screen.getByText(recordValuesNumeric[0].payload)).not.toBeVisible();
    });
});
