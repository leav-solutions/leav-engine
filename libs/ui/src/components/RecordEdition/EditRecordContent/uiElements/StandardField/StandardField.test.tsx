// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {
    EditRecordReducerActionsTypes,
    initialState
} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import * as useEditRecordReducer from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import * as useRefreshFieldValues from '_ui/hooks/useRefreshFieldValues/useRefreshFieldValues';
import {
    AttributeFormat,
    AttributeType,
    RecordFormAttributeStandardAttributeFragment,
    ValueDetailsValueFragment
} from '_ui/_gqlTypes';
import {IRecordPropertyAttribute} from '_ui/_queries/records/getRecordPropertiesQuery';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {mockFormElementInput} from '_ui/__mocks__/common/form';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockModifier} from '_ui/__mocks__/common/value';
import {
    APICallStatus,
    DeleteMultipleValuesFunc,
    DeleteValueFunc,
    FormElement,
    ISubmitMultipleResult,
    SubmitValueFunc
} from '../../_types';
import StandardField from './StandardField';
import {AntForm} from 'aristid-ds';
import {getAntdFormInitialValues} from '../../antdUtils';

jest.mock('../../hooks/useExecuteDeleteValueMutation');

jest.useRealTimers();
jest.setTimeout(15000);

const _makeRecordForm = (payloads: {payload: any; raw_payload: any}, format: AttributeFormat) => ({
    dependencyAttributes: [],
    elements: [
        {
            ...mockFormElementInput,
            settings: [
                {key: 'label', value: 'test attribute'},
                {key: 'attribute', value: 'test_attribute'}
            ],
            attribute: {...mockFormAttribute, format},
            values: [
                {
                    created_at: 123456789,
                    modified_at: 123456789,
                    created_by: mockModifier,
                    modified_by: mockModifier,
                    id_value: null,
                    metadata: null,
                    version: null,
                    ...payloads
                }
            ]
        }
    ],
    id: 'edition',
    recordId: 'recordId',
    library: {id: 'libraryId'}
});

describe('StandardField', () => {
    const mockEditRecordDispatch = jest.fn();
    jest.spyOn(useEditRecordReducer, 'useEditRecordReducer').mockImplementation(() => ({
        state: {...initialState, record: {...mockRecord}},
        dispatch: mockEditRecordDispatch
    }));

    jest.spyOn(useRefreshFieldValues, 'default').mockImplementation(() => ({
        fetchValues: jest.fn()
    }));

    const mockRecordValuesCommon = {
        created_at: 123456789,
        modified_at: 123456789,
        created_by: mockModifier,
        modified_by: mockModifier,
        id_value: null,
        metadata: null,
        version: null
    };

    window.HTMLElement.prototype.scrollIntoView = jest.fn();

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

    global.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn()
    }));

    beforeEach(() => jest.clearAllMocks());

    describe('Display value with read/write mode', () => {
        const testCases = [
            {
                format: AttributeFormat.text,
                payload: 'My value formatted',
                rawPayload: 'Some raw value',
                inputRole: 'textbox'
            },
            {
                format: AttributeFormat.numeric,
                payload: '42,00 €',
                rawPayload: '42',
                inputRole: 'spinbutton'
            },
            {
                format: AttributeFormat.date,
                payload: '08 juin 1987',
                rawPayload: '550108800',
                inputRole: 'textbox',
                inputValue: '1987-06-08'
            },
            {
                format: AttributeFormat.date_range,
                payload: {from: '1er janvier 2024', to: '1er janvier 2025'},
                readValue: 'record_edition.date_range_value|1er janvier 2024|1er janvier 2025',
                rawPayload: {
                    from: 1704067200,
                    to: 1735689600
                },
                inputRole: 'textbox',
                inputValue: '2024-01-01'
            },
            {
                format: AttributeFormat.encrypted,
                readValue: '●●●●●●●',
                payload: 'true',
                rawPayload: 'true',
                inputTestId: 'kit-input-password',
                inputValue: ''
            }
        ];

        test.each(testCases)(
            'Format $format',
            async ({format, readValue, payload, rawPayload, inputRole, inputTestId, inputValue}) => {
                const payloads = {
                    payload,
                    raw_payload: rawPayload
                };
                const recordForm = _makeRecordForm(payloads, format);
                const formElement = {...recordForm.elements[0], settings: {}};

                const antdFormInitialValues = getAntdFormInitialValues(recordForm);
                render(
                    <AntForm initialValues={antdFormInitialValues}>
                        <AntForm.Item>
                            <StandardField element={formElement} {...baseProps} />
                        </AntForm.Item>
                    </AntForm>
                );

                const formattedValueElem = screen.getByText(readValue ?? String(payloads.payload));
                expect(formattedValueElem).toBeVisible();

                expect(screen.queryByRole(inputRole)).toBeNull();

                await userEvent.click(formattedValueElem);

                const inputElem = inputTestId ? screen.getAllByTestId(inputTestId) : screen.getAllByRole(inputRole);
                expect(inputElem[0]).toBeVisible();
                expect(inputElem[0]).toHaveValue(inputValue ?? String(payloads.raw_payload));
            }
        );
    });

    test('Display informations about value', async () => {
        render(<StandardField element={mockFormElementInput} {...baseProps} />);

        const valueDisplayElem = screen.getByRole('textbox');
        await userEvent.click(valueDisplayElem);

        await waitFor(() => {
            expect(mockEditRecordDispatch).toHaveBeenCalled();
        });

        expect(mockEditRecordDispatch.mock.calls[0][0].type).toBe(EditRecordReducerActionsTypes.SET_ACTIVE_VALUE);
    });

    test('Cancel input', async () => {
        render(<StandardField element={mockFormElementInput} {...baseProps} />);

        let inputElem = screen.getByRole('textbox');
        await userEvent.click(inputElem);

        const cancelBtn = await screen.findByRole('button', {name: 'global.cancel'});
        expect(cancelBtn).toBeVisible();

        inputElem = screen.getByRole('textbox');
        await userEvent.clear(inputElem);
        await userEvent.type(inputElem, 'value modified');
        await waitFor(() => {
            expect(inputElem).toHaveValue('value modified');
        });

        await userEvent.click(cancelBtn);

        inputElem = screen.getByRole('textbox');

        await waitFor(() => {
            expect(inputElem).toHaveValue('My value formatted');
        });
        expect(inputElem).not.toHaveFocus();
    });

    test('Submit on enter', async () => {
        render(<StandardField element={mockFormElementInput} {...baseProps} />);

        const valueDisplayElem = screen.getByRole('textbox');

        await userEvent.click(valueDisplayElem);

        const inputElem = screen.getByRole('textbox');

        await userEvent.type(inputElem, 'value modified{enter}');

        await waitFor(() => {
            expect(mockHandleSubmit).toHaveBeenCalled();
        });
    });

    test('Disable readonly attribute', async () => {
        render(
            <StandardField
                element={{...mockFormElementInput, attribute: {...mockFormAttribute, readonly: true}}}
                {...baseProps}
            />
        );

        const inputElem = screen.getByRole('textbox');

        expect(inputElem).toBeDisabled();
    });

    test('Display error message', async () => {
        const onSubmitFail: SubmitValueFunc = jest.fn().mockReturnValue({
            status: APICallStatus.ERROR,
            error: 'ERROR_MESSAGE'
        });

        render(<StandardField element={mockFormElementInput} {...baseProps} onValueSubmit={onSubmitFail} />);

        await userEvent.click(screen.getByRole('textbox'));

        const submitBtn = await screen.findByRole('button', {name: 'global.submit'});
        await userEvent.click(submitBtn);

        expect(screen.getByText('ERROR_MESSAGE')).toBeInTheDocument();
    });

    test('On multiple-values attribute, can delete all values', async () => {
        render(
            <StandardField
                element={{
                    ...mockFormElementInput,
                    attribute: {...mockFormAttribute, multiple_values: true},
                    values: [
                        {
                            ...mockRecordValuesCommon,
                            id_value: '1',
                            value: 'value1',
                            raw_value: 'value1'
                        },
                        {
                            ...mockRecordValuesCommon,
                            id_value: '2',
                            value: 'value2',
                            raw_value: 'value2'
                        }
                    ]
                }}
                {...baseProps}
            />
        );

        const deleteAllButton = screen.getByRole('button', {name: 'delete-all-values'});
        expect(deleteAllButton).toBeInTheDocument();

        // Click on the parent, because of the issue on Tooltip. See DeleteAllValuesBtn component file
        await userEvent.click(deleteAllButton.parentElement);

        const confirmBtn = await screen.findByRole('button', {name: /confirm/});
        await userEvent.click(confirmBtn);

        await waitFor(() => {
            expect(baseProps.onDeleteMultipleValues).toBeCalled();
        });
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
                    ...(mockFormElementWithValuesList.attribute as RecordFormAttributeStandardAttributeFragment)
                        .values_list,
                    allowFreeEntry: true
                }
            }
        };

        test('Display values list', async () => {
            render(<StandardField element={{...mockFormElementWithValuesList, values: []}} {...baseProps} />);

            await userEvent.click(screen.getByRole('textbox'));

            expect(await screen.findByText('My value')).toBeInTheDocument();
            expect(screen.getByText('Other value')).toBeInTheDocument();

            expect(screen.queryByRole('button', {name: 'global.submit'})).not.toBeInTheDocument();
        });

        test('Filters list when typing', async () => {
            render(<StandardField element={{...mockFormElementWithValuesList, values: []}} {...baseProps} />);

            const originInputElem = screen.getByRole('textbox');
            await userEvent.click(originInputElem);

            expect(await screen.findByText('My value')).toBeInTheDocument();
            expect(screen.getByText('Other value')).toBeInTheDocument();

            const editingInputElem = screen.getByRole('textbox');
            await userEvent.type(editingInputElem, 'Other');

            await waitFor(() => {
                expect(screen.queryByText('My value')).not.toBeInTheDocument();
            });
            expect(screen.getByText('Other value')).toBeInTheDocument();
        });

        test('On click on a value, save it', async () => {
            render(<StandardField element={{...mockFormElementWithValuesList, values: []}} {...baseProps} />);

            const inputElem = screen.getByRole('textbox');
            await userEvent.click(inputElem);

            const elem = await screen.findByText('My value');
            await userEvent.click(elem);

            await waitFor(() => {
                expect(mockHandleSubmit).toHaveBeenCalledWith(
                    [{idValue: null, value: 'My value', attribute: mockFormElementWithValuesList.attribute}],
                    null
                );
            });
        });

        test('On Enter, first matching value is selected', async () => {
            render(<StandardField element={{...mockFormElementWithValuesList, values: []}} {...baseProps} />);

            const inputElem = screen.getByRole('textbox');
            await userEvent.click(inputElem);

            const editingInputElem = screen.getByRole('textbox');
            await userEvent.type(editingInputElem, '{enter}');

            await waitFor(() => {
                expect(mockHandleSubmit).toHaveBeenCalledWith(
                    [
                        {
                            idValue: null,
                            value: 'My value',
                            attribute: mockFormElementWithValuesList.attribute
                        }
                    ],
                    null
                );
            });
        });

        test('If no match, display a message', async () => {
            render(<StandardField element={{...mockFormElementWithValuesList, values: []}} {...baseProps} />);

            const originInputElem = screen.getByRole('textbox');
            await userEvent.click(originInputElem);

            const editingInputElem = screen.getByRole('textbox');
            await userEvent.type(editingInputElem, 'zzz');
            expect(await screen.findByText('record_edition.no_matching_value')).toBeInTheDocument();
        });

        test('If open values list, display submit button', async () => {
            render(<StandardField element={{...mockFormElementWithValuesListOpen, values: []}} {...baseProps} />);

            await userEvent.click(screen.getByRole('textbox'));

            expect(screen.getByRole('button', {name: 'global.submit'})).toBeInTheDocument();
        });

        test('If open values list, can copy a value from the list and edit it', async () => {
            render(<StandardField element={{...mockFormElementWithValuesListOpen, values: []}} {...baseProps} />);

            await userEvent.click(screen.getByRole('textbox'));

            const copyValueBtn = await screen.findAllByRole('button', {name: 'copy'});
            expect(copyValueBtn).toHaveLength(2);

            await userEvent.click(copyValueBtn[0]);

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toHaveValue('My value');
            });
        });

        test('If open values list, current value appears on the list', async () => {
            render(<StandardField element={{...mockFormElementWithValuesListOpen, values: []}} {...baseProps} />);

            await userEvent.click(screen.getByRole('textbox'));

            const editingInputElem = screen.getByRole('textbox');
            await userEvent.type(editingInputElem, 'Some new value');

            expect(screen.getByText(/Some new value/)).toBeInTheDocument();
        });
    });
});
