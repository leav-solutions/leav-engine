// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {AttributeFormat, AttributeType, ValueDetailsValueFragment} from '_ui/_gqlTypes';
import {IRecordPropertyAttribute} from '_ui/_queries/records/getRecordPropertiesQuery';
import {render, screen} from '_ui/_tests/testUtils';
import {mockFormElementInput, mockFormElementMultipleInput} from '_ui/__mocks__/common/form';
import {mockModifier} from '_ui/__mocks__/common/value';
import {
    APICallStatus,
    DeleteMultipleValuesFunc,
    DeleteValueFunc,
    ISubmitMultipleResult,
    SubmitValueFunc
} from '../../_types';
import StandardField from './StandardField';
import {AntForm} from 'aristid-ds';
import {RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm';

describe('StandardField', () => {
    const mockAttribute: IRecordPropertyAttribute = {
        id: 'test_attribute',
        label: {en: 'Test Attribute'},
        format: AttributeFormat.text,
        type: AttributeType.simple,
        system: false
    };

    const newFormatedValue = 'New formated value';
    const idValue = 'id_value';
    const mockSubmitRes: ISubmitMultipleResult = {
        status: APICallStatus.SUCCESS,
        values: [
            {
                id_value: idValue,
                created_at: 1234567890,
                created_by: {
                    ...mockModifier
                },
                modified_at: 1234567890,
                modified_by: {
                    ...mockModifier
                },
                value: newFormatedValue,
                raw_value: 'new raw value',
                payload: newFormatedValue,
                raw_payload: 'new raw value',
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
        readonly: false,
        onValueSubmit: mockHandleSubmit,
        onValueDelete: mockHandleDelete,
        onDeleteMultipleValues: mockHandleMultipleValues
    };

    beforeEach(() => jest.clearAllMocks());

    describe('Mono', () => {
        const initialValues = {
            [mockFormElementInput.attribute.id]: (
                mockFormElementInput.values[0] as RecordFormElementsValueStandardValue
            ).raw_payload
        };

        test('Should display an error with missing attribute', () => {
            render(
                <AntForm>
                    <StandardField element={{...mockFormElementInput, attribute: null}} {...baseProps} />
                </AntForm>
            );

            expect(screen.getByText('record_edition.missing_attribute')).toBeVisible();
        });

        test('Should display the formated value', async () => {
            render(
                <AntForm>
                    <StandardField element={mockFormElementInput} {...baseProps} />
                </AntForm>
            );

            const textInput = screen.getByRole('textbox');

            expect(textInput).toHaveValue('My value formatted');
        });

        test('Should display the value on focus', async () => {
            render(
                <AntForm initialValues={initialValues}>
                    <StandardField element={mockFormElementInput} {...baseProps} />
                </AntForm>
            );

            const textInput = screen.getByRole('textbox');
            await userEvent.click(textInput);

            expect(textInput).toHaveValue('my_raw_payload');
        });

        test('Should do nothing on blur without change', async () => {
            render(
                <AntForm initialValues={initialValues}>
                    <StandardField element={mockFormElementInput} {...baseProps} />
                </AntForm>
            );

            const textInput = screen.getByRole('textbox');
            await userEvent.click(textInput);
            await userEvent.tab();

            expect(mockHandleSubmit).not.toHaveBeenCalled();
            expect(mockHandleDelete).not.toHaveBeenCalled();
            expect(mockHandleMultipleValues).not.toHaveBeenCalled();
            expect(textInput).toHaveValue('My value formatted');
        });

        test('Should save the value on blur with change', async () => {
            render(
                <AntForm initialValues={initialValues}>
                    <StandardField
                        element={{
                            ...mockFormElementInput,
                            values: [{...mockFormElementInput.values[0], id_value: idValue}]
                        }}
                        {...baseProps}
                    />
                </AntForm>
            );

            const textInput = screen.getByRole('textbox');
            await userEvent.click(textInput);

            const newValue = 'New Value';
            await userEvent.clear(textInput);
            await userEvent.type(textInput, newValue);
            await userEvent.tab();

            expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
            expect(mockHandleSubmit).toHaveBeenCalledWith(
                [
                    {
                        attribute: mockFormElementInput.attribute,
                        idValue,
                        value: newValue
                    }
                ],
                null
            );
            expect(mockHandleDelete).not.toHaveBeenCalled();
            expect(mockHandleMultipleValues).not.toHaveBeenCalled();
            expect(textInput).toHaveValue(newFormatedValue);
        });
    });

    describe('multiple', () => {
        const initialValues = {
            [mockFormElementInput.attribute.id]: [
                (mockFormElementInput.values[0] as RecordFormElementsValueStandardValue).raw_payload,
                (mockFormElementInput.values[0] as RecordFormElementsValueStandardValue).raw_payload
            ]
        };

        test('Should call onValueDelete click on delete', async () => {
            render(
                <AntForm initialValues={initialValues}>
                    <StandardField
                        element={{
                            ...mockFormElementMultipleInput,
                            values: [{...mockFormElementMultipleInput.values[0], id_value: idValue}]
                        }}
                        {...baseProps}
                    />
                </AntForm>
            );

            const deleteButtons = screen.getAllByTitle('record_edition.delete_value');
            expect(deleteButtons).toHaveLength(2);
            await userEvent.click(screen.getAllByTitle('record_edition.delete_value')[0]);
            expect(mockHandleDelete).toHaveBeenCalledWith(
                {
                    id_value: idValue
                },
                mockFormElementMultipleInput.attribute.id
            );
        });

        describe('Delete all values', () => {
            test('Should not call onDeleteMultipleValues click on delete all and cancel', async () => {
                const idValue2 = 'idValue2';
                const backendValues = [
                    {...mockFormElementMultipleInput.values[0], id_value: idValue},
                    {...mockFormElementMultipleInput.values[0], id_value: idValue2}
                ];

                render(
                    <AntForm initialValues={initialValues}>
                        <StandardField
                            element={{
                                ...mockFormElementMultipleInput,
                                values: backendValues
                            }}
                            {...baseProps}
                        />
                    </AntForm>
                );

                const deleteAllButton = screen.getByRole('button', {name: 'record_edition.delete_all'});
                await userEvent.click(deleteAllButton);
                expect(screen.getByText('record_edition.delete_all_values')).toBeVisible();
                const cancelDeleteAllButton = screen.getByText('global.cancel');
                await userEvent.click(cancelDeleteAllButton);
                expect(mockHandleMultipleValues).not.toHaveBeenCalled();
            });

            test('Should call onDeleteMultipleValues click on delete all and confirm', async () => {
                const idValue2 = 'idValue2';
                const backendValues = [
                    {...mockFormElementMultipleInput.values[0], id_value: idValue},
                    {...mockFormElementMultipleInput.values[0], id_value: idValue2}
                ];

                render(
                    <AntForm initialValues={initialValues}>
                        <StandardField
                            element={{
                                ...mockFormElementMultipleInput,
                                values: backendValues
                            }}
                            {...baseProps}
                        />
                    </AntForm>
                );

                const deleteAllButton = screen.getByRole('button', {name: 'record_edition.delete_all'});
                await userEvent.click(deleteAllButton);
                expect(screen.getByText('record_edition.delete_all_values')).toBeVisible();
                const confirmDeleteAllButton = screen.getByText('global.confirm');
                await userEvent.click(confirmDeleteAllButton);
                expect(mockHandleMultipleValues).toHaveBeenCalledWith(
                    mockFormElementMultipleInput.attribute.id,
                    backendValues,
                    null
                );
            });
        });
    });
});
