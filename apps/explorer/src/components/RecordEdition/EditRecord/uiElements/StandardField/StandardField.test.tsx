// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    EditRecordReducerActionsTypes,
    initialState
} from 'components/RecordEdition/editRecordReducer/editRecordReducer';
import * as useEditRecordReducer from 'components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {IRecordPropertyAttribute} from 'graphQL/queries/records/getRecordPropertiesQuery';
import React from 'react';
import {GET_FORM_forms_list_elements_elements_attribute_StandardAttribute} from '_gqlTypes/GET_FORM';
import {AttributeFormat, AttributeType} from '_gqlTypes/globalTypes';
import {SAVE_VALUE_BATCH_saveValueBatch_values_Value_attribute} from '_gqlTypes/SAVE_VALUE_BATCH';
import {mockFormAttribute} from '__mocks__/common/attribute';
import {mockFormElementInput} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import {mockModifier} from '__mocks__/common/value';
import {APICallStatus, DeleteValueFunc, FormElement, ISubmitMultipleResult, SubmitValueFunc} from '../../_types';
import StandardField from './StandardField';

jest.mock('../../hooks/useDeleteValueMutation');
jest.mock('hooks/LangHook/LangHook');

describe('StandardField', () => {
    const mockEditRecordDispatch = jest.fn();
    jest.spyOn(useEditRecordReducer, 'useEditRecordReducer').mockImplementation(() => ({
        state: initialState,
        dispatch: mockEditRecordDispatch
    }));

    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    const mockAttribute: IRecordPropertyAttribute = {
        id: 'test_attribute',
        label: {fr: 'Test Attribute'},
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
                attribute: mockAttribute as SAVE_VALUE_BATCH_saveValueBatch_values_Value_attribute
            }
        ]
    };
    const mockHandleSubmit: SubmitValueFunc = jest.fn().mockReturnValue(mockSubmitRes);
    const mockHandleDelete: DeleteValueFunc = jest.fn().mockReturnValue({status: APICallStatus.SUCCESS});

    const recordValues = {
        test_attribute: [
            {
                value: 'My value formatted',
                raw_value: 'my_raw_value',
                created_at: 123456789,
                modified_at: 123456789,
                created_by: mockModifier,
                modified_by: mockModifier,
                id_value: null,
                attribute: mockAttribute
            }
        ]
    };

    beforeEach(() => jest.clearAllMocks());

    test('Render text field, type value and submit', async () => {
        render(
            <StandardField
                element={mockFormElementInput}
                recordValues={recordValues}
                record={mockRecordWhoAmI}
                onValueSubmit={mockHandleSubmit}
                onValueDelete={mockHandleDelete}
            />
        );

        const inputElem = screen.getByRole('textbox');
        expect(inputElem).toBeInTheDocument();
        expect(inputElem).toHaveValue('My value formatted');

        await act(async () => {
            userEvent.click(inputElem);
        });

        // When editing, input is a new component, thus we have to get it again
        const editingInputElem = screen.getByRole('textbox');
        expect(editingInputElem).toHaveValue('my_raw_value');

        const submitBtn = screen.getByRole('button', {name: 'global.submit'});
        expect(submitBtn).toBeVisible();

        userEvent.clear(editingInputElem);
        userEvent.type(editingInputElem, 'value modified');
        expect(editingInputElem).toHaveValue('value modified');

        await act(async () => {
            userEvent.click(submitBtn);
        });

        expect(mockHandleSubmit).toHaveBeenCalled();
    });

    test('Display informations about value', async () => {
        render(
            <StandardField
                element={mockFormElementInput}
                recordValues={recordValues}
                record={mockRecordWhoAmI}
                onValueSubmit={mockHandleSubmit}
                onValueDelete={mockHandleDelete}
            />
        );

        const valueDisplayElem = screen.getByRole('textbox');
        await act(async () => {
            userEvent.click(valueDisplayElem);
        });

        expect(mockEditRecordDispatch.mock.calls[0][0].type).toBe(EditRecordReducerActionsTypes.SET_ACTIVE_VALUE);
    });

    test('Cancel input', async () => {
        await act(async () => {
            render(
                <StandardField
                    element={mockFormElementInput}
                    recordValues={recordValues}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        let inputElem = screen.getByRole('textbox');
        await act(async () => {
            userEvent.click(inputElem);
        });

        const cancelBtn = screen.getByRole('button', {name: 'global.cancel'});
        expect(cancelBtn).toBeVisible();

        inputElem = screen.getByRole('textbox');
        userEvent.clear(inputElem);
        userEvent.type(inputElem, 'value modified');
        expect(inputElem).toHaveValue('value modified');

        await act(async () => {
            userEvent.click(cancelBtn);
        });

        inputElem = screen.getByRole('textbox');
        expect(inputElem).toHaveValue('My value formatted');
        expect(inputElem).not.toHaveFocus();
    });

    test('Submit on enter', async () => {
        await act(async () => {
            render(
                <StandardField
                    element={mockFormElementInput}
                    recordValues={recordValues}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        const valueDisplayElem = screen.getByRole('textbox');

        userEvent.click(valueDisplayElem);

        const inputElem = screen.getByRole('textbox');

        await act(async () => {
            userEvent.type(inputElem, 'value modified{enter}');
        });
        expect(mockHandleSubmit).toHaveBeenCalled();
    });

    test('Disable system attribute', async () => {
        const recordValuesSystem = {
            test_attribute: [
                {
                    value: 'My value formatted',
                    raw_value: 'my_raw_value',
                    created_at: 123456789,
                    modified_at: 123456789,
                    created_by: mockModifier,
                    modified_by: mockModifier,
                    id_value: null
                }
            ]
        };

        render(
            <StandardField
                element={{...mockFormElementInput, attribute: {...mockFormAttribute, system: true}}}
                recordValues={recordValuesSystem}
                record={mockRecordWhoAmI}
                onValueSubmit={mockHandleSubmit}
                onValueDelete={mockHandleDelete}
            />
        );

        const inputElem = screen.getByRole('textbox');

        expect(inputElem).toBeDisabled();
    });

    test('Render date field', async () => {
        const recordValuesDate = {
            test_attribute: [
                {
                    value: '2021-03-19T17:24:00',
                    raw_value: '1616174663',
                    created_at: 123456789,
                    modified_at: 123456789,
                    created_by: mockModifier,
                    modified_by: mockModifier,
                    id_value: null
                }
            ]
        };
        render(
            <StandardField
                element={{...mockFormElementInput, attribute: {...mockFormAttribute, format: AttributeFormat.date}}}
                recordValues={recordValuesDate}
                record={mockRecordWhoAmI}
                onValueSubmit={mockHandleSubmit}
                onValueDelete={mockHandleDelete}
            />
        );

        const inputElem = screen.getByRole('textbox');
        userEvent.click(inputElem);

        const calendarElem = screen.getByTestId('datepicker');
        expect(calendarElem).toBeInTheDocument();

        await act(async () => {
            userEvent.click(screen.getByRole('cell', {name: '2021-03-11'}));
        });
        expect(mockHandleSubmit).toHaveBeenCalled();
    });

    test('Render checkbox', async () => {
        const recordValuesBoolean = {
            test_attribute: [
                {
                    value: 'true',
                    raw_value: 'true',
                    created_at: 123456789,
                    modified_at: 123456789,
                    created_by: mockModifier,
                    modified_by: mockModifier,
                    id_value: null
                }
            ]
        };

        render(
            <StandardField
                element={{...mockFormElementInput, attribute: {...mockFormAttribute, format: AttributeFormat.boolean}}}
                recordValues={recordValuesBoolean}
                record={mockRecordWhoAmI}
                onValueSubmit={mockHandleSubmit}
                onValueDelete={mockHandleDelete}
            />
        );

        const inputElem = screen.getByRole('checkbox');

        await act(async () => {
            userEvent.click(inputElem);
        });
        expect(mockHandleSubmit).toHaveBeenCalled();
    });

    test('Render encrypted field', async () => {
        const recordValuesEncrypted = {
            test_attribute: [
                {
                    value: 'my_hashed_pwd',
                    raw_value: 'my_hashed_pwd',
                    created_at: 123456789,
                    modified_at: 123456789,
                    created_by: mockModifier,
                    modified_by: mockModifier,
                    id_value: null
                }
            ]
        };
        render(
            <StandardField
                element={{
                    ...mockFormElementInput,
                    attribute: {...mockFormAttribute, format: AttributeFormat.encrypted}
                }}
                recordValues={recordValuesEncrypted}
                record={mockRecordWhoAmI}
                onValueSubmit={mockHandleSubmit}
                onValueDelete={mockHandleDelete}
            />
        );

        const inputElem = screen.getByRole('textbox');
        expect(inputElem).toHaveValue();
        expect(inputElem).not.toHaveValue('my_hashed_pwd');

        userEvent.click(inputElem);

        const pwdElem = screen.getByTestId('encrypted-input');

        expect(pwdElem).toBeInTheDocument();
        expect(pwdElem).toHaveValue('');
    });

    test('Render numeric input', async () => {
        const recordValuesNumeric = {
            test_attribute: [
                {
                    value: '123456',
                    raw_value: '123456',
                    id_value: null,
                    created_at: 123456789,
                    modified_at: 123456789,
                    created_by: mockModifier,
                    modified_by: mockModifier
                }
            ]
        };

        render(
            <StandardField
                element={{...mockFormElementInput, attribute: {...mockFormAttribute, format: AttributeFormat.numeric}}}
                recordValues={recordValuesNumeric}
                record={mockRecordWhoAmI}
                onValueSubmit={mockHandleSubmit}
                onValueDelete={mockHandleDelete}
            />
        );

        const inputElem = screen.getByRole('textbox');
        expect(inputElem).toHaveValue('123456');

        userEvent.click(inputElem);

        expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    test('Display error message', async () => {
        const onSubmitFail: SubmitValueFunc = jest.fn().mockReturnValue({
            status: APICallStatus.ERROR,
            error: 'ERROR_MESSAGE'
        });

        render(
            <StandardField
                element={mockFormElementInput}
                recordValues={recordValues}
                record={mockRecordWhoAmI}
                onValueSubmit={onSubmitFail}
                onValueDelete={mockHandleDelete}
            />
        );

        userEvent.click(screen.getByRole('textbox'));

        await act(async () => {
            userEvent.click(screen.getByRole('button', {name: 'global.submit'}));
        });

        expect(screen.getByText('ERROR_MESSAGE')).toBeInTheDocument();
    });

    test('Delete value', async () => {
        render(
            <StandardField
                element={mockFormElementInput}
                recordValues={recordValues}
                record={mockRecordWhoAmI}
                onValueSubmit={mockHandleSubmit}
                onValueDelete={mockHandleDelete}
            />
        );

        const inputWrapper = screen.getByTestId('input-wrapper');
        userEvent.hover(inputWrapper, null);

        const deleteBtn = screen.getByRole('button', {hidden: true});
        expect(deleteBtn).toBeInTheDocument();

        await act(async () => {
            userEvent.click(deleteBtn);
        });

        const confirmDeleteBtn = screen.getByRole('button', {name: 'delete-confirm-button'});

        await act(async () => {
            userEvent.click(confirmDeleteBtn);
        });

        expect(mockHandleDelete).toHaveBeenCalled();
    });

    describe('Values list', () => {
        const mockFormElementWithValuesList: FormElement<{}> = {
            ...mockFormElementInput,
            attribute: {
                ...mockFormElementInput.attribute,
                values_list: {
                    enable: true,
                    allowFreeEntry: false,
                    values: ['My value', 'Other value']
                }
            }
        };

        const mockFormElementWithValuesListOpen = {
            ...mockFormElementWithValuesList,
            attribute: {
                ...mockFormElementWithValuesList.attribute,
                values_list: {
                    ...(mockFormElementWithValuesList.attribute as GET_FORM_forms_list_elements_elements_attribute_StandardAttribute)
                        .values_list,
                    allowFreeEntry: true
                }
            }
        };

        const recordValuesNoValue = {test_attribute: []};

        test('Display values list', async () => {
            render(
                <StandardField
                    element={mockFormElementWithValuesList}
                    recordValues={recordValuesNoValue}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );

            userEvent.click(screen.getByRole('textbox'));

            expect(screen.getByText('My value')).toBeInTheDocument();
            expect(screen.getByText('Other value')).toBeInTheDocument();

            expect(screen.queryByRole('button', {name: 'global.submit'})).not.toBeInTheDocument();
        });

        test('Filters list when typing', async () => {
            render(
                <StandardField
                    element={mockFormElementWithValuesList}
                    recordValues={recordValuesNoValue}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );

            const originInputElem = screen.getByRole('textbox');
            userEvent.click(originInputElem);

            expect(screen.getByText('My value')).toBeInTheDocument();
            expect(screen.getByText('Other value')).toBeInTheDocument();

            const editingInputElem = screen.getByRole('textbox');
            userEvent.type(editingInputElem, 'Other');

            expect(screen.queryByText('My value')).not.toBeInTheDocument();
            expect(screen.getByText('Other value')).toBeInTheDocument();
        });

        test('On click on a value, save it', async () => {
            render(
                <StandardField
                    element={mockFormElementWithValuesList}
                    recordValues={recordValuesNoValue}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );

            const inputElem = screen.getByRole('textbox');
            userEvent.click(inputElem);
            await act(async () => {
                userEvent.click(screen.getByText('My value'));
            });

            expect(mockHandleSubmit).toHaveBeenCalledWith([
                {idValue: null, value: 'My value', attribute: mockFormElementWithValuesList.attribute}
            ]);
        });

        test('On Enter, first matching value is selected', async () => {
            render(
                <StandardField
                    element={mockFormElementWithValuesList}
                    recordValues={recordValuesNoValue}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );

            const inputElem = screen.getByRole('textbox');
            userEvent.click(inputElem);

            const editingInputElem = screen.getByRole('textbox');
            await act(async () => {
                userEvent.type(editingInputElem, '{enter}');
            });

            expect(mockHandleSubmit).toHaveBeenCalledWith([
                {
                    idValue: null,
                    value: 'My value',
                    attribute: mockFormElementWithValuesList.attribute
                }
            ]);
        });

        test('If no match, display a message', async () => {
            render(
                <StandardField
                    element={mockFormElementWithValuesList}
                    recordValues={recordValuesNoValue}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );

            const originInputElem = screen.getByRole('textbox');
            await act(async () => {
                userEvent.click(originInputElem);
            });

            const editingInputElem = screen.getByRole('textbox');
            await act(async () => {
                userEvent.type(editingInputElem, 'zzz');
            });
            expect(screen.getByText('record_edition.no_matching_value')).toBeInTheDocument();
        });

        test('If open values list, display submit button', async () => {
            render(
                <StandardField
                    element={mockFormElementWithValuesListOpen}
                    recordValues={recordValuesNoValue}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );

            userEvent.click(screen.getByRole('textbox'));

            expect(screen.queryByRole('button', {name: 'global.submit'})).toBeInTheDocument();
        });

        test('If open values list, can copy a value from the list and edit it', async () => {
            await act(async () => {
                render(
                    <StandardField
                        element={mockFormElementWithValuesListOpen}
                        recordValues={recordValuesNoValue}
                        record={mockRecordWhoAmI}
                        onValueSubmit={mockHandleSubmit}
                        onValueDelete={mockHandleDelete}
                    />
                );
            });

            await act(async () => {
                userEvent.click(screen.getByRole('textbox'));
            });

            const copyValueBtn = screen.getAllByRole('button', {name: 'copy'});
            expect(copyValueBtn).toHaveLength(2);

            await act(async () => {
                userEvent.click(copyValueBtn[0]);
            });

            expect(screen.getByRole('textbox')).toHaveValue('My value');
        });

        test('If open values list, current value appears on the list', async () => {
            await act(async () => {
                render(
                    <StandardField
                        element={mockFormElementWithValuesListOpen}
                        recordValues={recordValuesNoValue}
                        record={mockRecordWhoAmI}
                        onValueSubmit={mockHandleSubmit}
                        onValueDelete={mockHandleDelete}
                    />
                );
            });

            await act(async () => {
                userEvent.click(screen.getByRole('textbox'));
            });

            const editingInputElem = screen.getByRole('textbox');
            userEvent.type(editingInputElem, 'Some new value');

            expect(screen.getByText(/Some new value/)).toBeInTheDocument();
        });
    });
});
