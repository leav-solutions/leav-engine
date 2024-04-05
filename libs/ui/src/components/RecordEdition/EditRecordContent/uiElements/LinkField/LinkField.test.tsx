// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICommonFieldsSettings} from '@leav/utils';
import userEvent from '@testing-library/user-event';
import {
    EditRecordReducerActionsTypes,
    initialState
} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import * as useEditRecordReducer from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {IUseGetRecordColumnsValuesQueryHook} from '_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';
import {RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {getRecordsFromLibraryQuery} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {ICustomRenderOptions, render, screen, waitFor, within} from '_ui/_tests/testUtils';
import {mockAttributeLink} from '_ui/__mocks__/common/attribute';
import {mockFormElementLink, mockLinkValue} from '_ui/__mocks__/common/form';
import {mockLibrarySimple} from '_ui/__mocks__/common/library';
import {mockRecord} from '_ui/__mocks__/common/record';
import {mockModifier} from '_ui/__mocks__/common/value';
import * as useSaveValueBatchMutation from '../../hooks/useExecuteSaveValueBatchMutation';
import {RecordEditionContext} from '../../hooks/useRecordEditionContext';
import {
    APICallStatus,
    DeleteMultipleValuesFunc,
    DeleteValueFunc,
    FormElement,
    IFormElementProps,
    ISubmitMultipleResult,
    SubmitValueFunc
} from '../../_types';
import LinkField from './LinkField';

jest.mock('_ui/components/SearchModal', () => ({
    SearchModal: () => <div>SearchModal</div>
}));

jest.mock('_ui/components/RecordEdition/EditRecord', () => ({
    EditRecord: () => <div>EditRecord</div>
}));

jest.mock('_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery', () => ({
    useGetRecordValuesQuery: (): Partial<IUseGetRecordColumnsValuesQueryHook> => ({
        loading: false,
        data: {
            [mockRecord.id]: {
                _id: null,
                col1: [{value: 'col1 value'}],
                col2: [{value: 'col2 value'}]
            }
        },
        refetch: jest.fn()
    })
}));

jest.mock('_ui/hooks/useRefreshFieldValues', () => ({
    useRefreshFieldValues: () => ({
        fetchValues: jest.fn().mockReturnValue([])
    })
}));

describe('LinkField', () => {
    const mockEditRecordDispatch = jest.fn();
    jest.spyOn(useEditRecordReducer, 'useEditRecordReducer').mockImplementation(() => ({
        state: initialState,
        dispatch: mockEditRecordDispatch
    }));

    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    const mockSubmitRes: ISubmitMultipleResult = {
        status: APICallStatus.SUCCESS,
        values: [
            {
                id_value: '123456',
                created_at: 1234567890,
                created_by: {
                    ...mockModifier
                },
                modified_at: 1234567890,
                modified_by: {
                    ...mockModifier
                },
                value: 'new value',
                version: null,
                attribute: {
                    ...mockAttributeLink,
                    system: false
                },
                linkValue: {
                    id: '123456',
                    whoAmI: {
                        ...mockRecord
                    }
                },
                metadata: null
            }
        ]
    };
    const mockHandleSubmit: SubmitValueFunc = jest.fn().mockReturnValue(mockSubmitRes);
    const mockHandleDelete: DeleteValueFunc = jest.fn().mockReturnValue({status: APICallStatus.SUCCESS});
    const mockHandleDeleteMultipleValues: DeleteMultipleValuesFunc = jest
        .fn()
        .mockReturnValue({status: APICallStatus.SUCCESS});

    const baseProps = {
        onValueSubmit: mockHandleSubmit,
        onValueDelete: mockHandleDelete,
        onDeleteMultipleValues: mockHandleDeleteMultipleValues
    };

    const _renderLinkField = (
        props: Partial<IFormElementProps<ICommonFieldsSettings>>,
        renderOptions?: ICustomRenderOptions
    ) => {
        const allProps = {
            ...baseProps,
            ...(props as IFormElementProps<ICommonFieldsSettings>)
        };

        return render(
            <RecordEditionContext.Provider
                value={{
                    record: mockRecord,
                    readOnly: false,
                    elements: null
                }}
            >
                <LinkField {...allProps} />
            </RecordEditionContext.Provider>,
            renderOptions
        );
    };

    beforeEach(() => jest.clearAllMocks());

    test('Display list of values', async () => {
        _renderLinkField({
            element: {
                ...mockFormElementLink,
                attribute: {
                    ...mockFormElementLink.attribute,
                    multiple_values: true
                }
            }
        });

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(1);
    });

    test('Display list of values with configured columns', async () => {
        const mockFormElementLinkWithColumns = {
            ...mockFormElementLink,
            settings: {
                ...mockFormElementLink.settings,
                label: 'My field',
                columns: [
                    {
                        id: 'col1',
                        label: 'First column'
                    },
                    {
                        id: 'col2',
                        label: 'Second column'
                    }
                ],
                displayRecordIdentity: true
            }
        };

        const recordValuesWithColumns = [
            {
                ...mockLinkValue,
                linkValue: {
                    ...mockLinkValue.linkValue,
                    col1: 'col1 value',
                    col2: 'col2 value'
                }
            }
        ];

        _renderLinkField({
            element: {
                ...mockFormElementLinkWithColumns,
                values: recordValuesWithColumns,
                attribute: {
                    ...mockFormElementLink.attribute,
                    multiple_values: true
                }
            }
        });

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('cell')).toHaveLength(3);
        expect(screen.getByText('col1 value')).toBeInTheDocument();
        expect(screen.getByText('col2 value')).toBeInTheDocument();
    });

    test('If no value, display a button to add a value', async () => {
        _renderLinkField({
            element: {
                ...mockFormElementLink,
                values: [],
                attribute: {
                    ...mockFormElementLink.attribute,
                    multiple_values: true
                }
            }
        });

        expect(screen.getAllByRole('table').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByRole('button', {name: /add/, hidden: true})).toBeInTheDocument();
    });

    test('If no value and cannot add, display a message', async () => {
        _renderLinkField({
            element: {
                ...mockFormElementLink,
                attribute: {...mockFormElementLink.attribute, readonly: true, multiple_values: true},
                values: []
            }
        });

        expect(screen.getByText('record_edition.no_value')).toBeInTheDocument();
    });

    test('Can edit and delete linked record', async () => {
        _renderLinkField({
            element: {
                ...mockFormElementLink,
                attribute: {
                    ...mockFormElementLink.attribute,
                    multiple_values: true
                }
            }
        });

        const row = screen.getByRole('row', {name: /record/});
        userEvent.hover(row);

        expect(screen.queryByRole('button', {name: /delete-value/, hidden: true})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'edit-record', hidden: true})).toBeInTheDocument();
    });

    test('Can delete all values', async () => {
        _renderLinkField({
            element: {
                ...mockFormElementLink,
                attribute: {
                    ...mockFormElementLink.attribute,
                    multiple_values: true
                }
            }
        });

        const deleteAllValuesButton = screen.getByRole('button', {name: /delete-all-values/, hidden: true});
        expect(deleteAllValuesButton).toBeInTheDocument();

        await userEvent.click(deleteAllValuesButton.parentElement);

        await userEvent.click(screen.getByRole('button', {name: /confirm/}));

        await waitFor(() => expect(baseProps.onDeleteMultipleValues).toBeCalled());
    });

    test('If multiple values, display add value button', async () => {
        const mockFormElementLinkMultivalue: FormElement<{}> = {
            ...mockFormElementLink,
            attribute: {
                ...mockFormElementLink.attribute,
                multiple_values: true
            }
        };
        _renderLinkField({element: {...mockFormElementLinkMultivalue}});

        expect(screen.getByRole('button', {name: /add/, hidden: true})).toBeInTheDocument();
    });

    test("If not multiple values, don't display add value button", async () => {
        const mockFormElementLinkNoMultivalue: FormElement<{}> = {
            ...mockFormElementLink,
            attribute: {
                ...mockFormElementLink.attribute,
                multiple_values: false
            }
        };

        _renderLinkField({element: {...mockFormElementLinkNoMultivalue}});

        expect(screen.queryByRole('button', {name: /add/, hidden: true})).not.toBeInTheDocument();
    });

    test('Can display value details', async () => {
        _renderLinkField({
            element: {
                ...mockFormElementLink,
                attribute: {
                    ...mockFormElementLink.attribute,
                    multiple_values: true
                }
            }
        });

        const valueDetailsButtons = screen.getAllByRole('button', {name: /info/, hidden: true});
        expect(valueDetailsButtons).toHaveLength(2);

        await userEvent.click(valueDetailsButtons[0]);

        expect(mockEditRecordDispatch.mock.calls[0][0].type).toBe(EditRecordReducerActionsTypes.SET_ACTIVE_VALUE);
    });

    it('should render MonoValueSelect', () => {
        const mockFormElementLinkNoMultivalue: FormElement<{}> = {
            ...mockFormElementLink,
            attribute: {
                ...mockFormElementLink.attribute,
                multiple_values: false
            }
        };

        _renderLinkField({element: {...mockFormElementLinkNoMultivalue}});

        expect(screen.getByRole('combobox')).toBeVisible();
    });

    describe('Values list', () => {
        const mockFormElementLinkMultivalue: FormElement<{}> = {
            ...mockFormElementLink,
            attribute: {
                ...mockFormElementLink.attribute,
                multiple_values: true,
                linkValuesList: {
                    enable: true,
                    allowFreeEntry: true,
                    values: [
                        {
                            id: '123456',
                            whoAmI: {
                                ...mockRecord
                            }
                        }
                    ]
                }
            }
        };

        const mockFormElementLinkMultivalueNoFreeEntry: FormElement<{}> = {
            ...mockFormElementLink,
            attribute: {
                ...mockFormElementLinkMultivalue.attribute,
                linkValuesList: {
                    enable: true,
                    allowFreeEntry: false,
                    values: (mockFormElementLinkMultivalue.attribute as RecordFormAttributeLinkAttributeFragment)
                        .linkValuesList.values
                }
            }
        };

        test('Can add record from values list on click on "add" button', async () => {
            _renderLinkField({
                element: {...mockFormElementLinkMultivalue},
                onValueSubmit: mockHandleSubmit,
                onValueDelete: mockHandleDelete,
                onDeleteMultipleValues: jest.fn()
            });

            const addValueBtn = screen.getByRole('button', {name: /add/, hidden: true});
            await userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));

            const valuesListElem = valuesAddBlock.getByText(mockRecord.label);
            expect(valuesListElem).toBeInTheDocument();

            await userEvent.click(valuesListElem);

            expect(mockHandleSubmit).toBeCalledWith(
                [
                    {
                        attribute: {...mockFormElementLinkMultivalue.attribute},
                        idValue: null,
                        value: {id: mockRecord.id, whoAmI: mockRecord}
                    }
                ],
                null
            );
            expect(screen.queryByTestId('values-add')).not.toBeInTheDocument();
        });

        test('Can filter values list', async () => {
            const mockFormElementLinkValuesList: FormElement<{}> = {
                ...mockFormElementLink,
                attribute: {
                    ...mockFormElementLinkMultivalue.attribute,
                    linkValuesList: {
                        enable: true,
                        allowFreeEntry: false,
                        values: [
                            {
                                id: '123456',
                                whoAmI: {
                                    ...mockRecord,
                                    label: 'valueA'
                                }
                            },
                            {
                                id: '123457',
                                whoAmI: {
                                    ...mockRecord,
                                    label: 'valueB'
                                }
                            }
                        ]
                    }
                }
            };
            _renderLinkField({
                element: {...mockFormElementLinkValuesList},
                onValueSubmit: mockHandleSubmit,
                onValueDelete: mockHandleDelete,
                onDeleteMultipleValues: jest.fn()
            });

            const addValueBtn = screen.getByRole('button', {name: /add/, hidden: true});
            await userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));
            const valuesListBlock = within(valuesAddBlock.getByTestId('values_list'));
            const valuesList = within(valuesListBlock.getAllByRole('list')[0]);

            expect(valuesList.getAllByRole('listitem')).toHaveLength(2);

            const searchInput = valuesAddBlock.getByRole('textbox', {name: /search_elements/});
            expect(searchInput).toBeInTheDocument();

            await userEvent.click(searchInput);

            await userEvent.type(searchInput, 'B{enter}', {delay: 5});

            expect(searchInput).toHaveValue('B');
            expect(valuesList.queryByText('valueA')).not.toBeInTheDocument();
            expect(valuesList.getByText('valueB')).toBeInTheDocument();
        });

        test('Can open search modal', async () => {
            const mockOnAddValue = jest.fn().mockReturnValue({
                status: APICallStatus.SUCCESS,
                value: {
                    id_value: null,
                    value: 'My value',
                    raw_value: 'My value'
                }
            });

            jest.spyOn(useSaveValueBatchMutation, 'default').mockImplementation(() => ({
                ...useSaveValueBatchMutation.default(),
                saveValues: mockOnAddValue
            }));

            _renderLinkField({
                element: {...mockFormElementLinkMultivalue},
                onValueSubmit: mockHandleSubmit,
                onValueDelete: mockHandleDelete,
                onDeleteMultipleValues: jest.fn()
            });

            const addValueBtn = screen.getByRole('button', {name: /add/, hidden: true});
            await userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));

            const advSearchButton = valuesAddBlock.getByRole('button', {name: /advanced_search/});
            expect(advSearchButton).toBeInTheDocument();

            await userEvent.click(advSearchButton);
            expect(screen.getByText('SearchModal')).toBeInTheDocument();
        });

        test('Can hide values add block', async () => {
            _renderLinkField({
                element: {...mockFormElementLinkMultivalue},
                onValueSubmit: mockHandleSubmit,
                onValueDelete: mockHandleDelete,
                onDeleteMultipleValues: jest.fn()
            });

            const addValueBtn = screen.getByRole('button', {name: /add/, hidden: true});
            await userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));
            await userEvent.click(valuesAddBlock.getByRole('button', {name: 'close'}));

            await waitFor(() => {
                expect(screen.queryByTestId('values-add')).not.toBeInTheDocument();
            });
        });

        test('If multiple values, can select multiple elements and add them', async () => {
            _renderLinkField({
                element: {...mockFormElementLinkMultivalue},
                onValueSubmit: mockHandleSubmit,
                onValueDelete: mockHandleDelete,
                onDeleteMultipleValues: jest.fn()
            });

            const addValueBtn = screen.getByRole('button', {name: /add/, hidden: true});
            await userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));

            const itemsCheckboxes = valuesAddBlock.getAllByRole('checkbox');
            for (const itemCheckbox of itemsCheckboxes) {
                await userEvent.click(itemCheckbox);
            }

            const submitBtn = valuesAddBlock.getByRole('button', {name: 'global.submit'});
            await userEvent.click(submitBtn);

            expect(mockHandleSubmit).toBeCalled();
            expect(screen.queryByTestId('values-add')).not.toBeInTheDocument();
        });

        test('If closed values list, do not display "advanced search button"', async () => {
            const mockOnAddValue = jest.fn().mockReturnValue({
                status: APICallStatus.SUCCESS,
                value: {
                    id_value: null,
                    value: 'My value',
                    raw_value: 'My value'
                }
            });

            jest.spyOn(useSaveValueBatchMutation, 'default').mockImplementation(() => ({
                ...useSaveValueBatchMutation.default(),
                saveValues: mockOnAddValue
            }));

            _renderLinkField({
                element: {...mockFormElementLinkMultivalueNoFreeEntry},
                onValueSubmit: mockHandleSubmit,
                onValueDelete: mockHandleDelete,
                onDeleteMultipleValues: jest.fn()
            });

            const addValueBtn = screen.getByRole('button', {name: /add/, hidden: true});
            await userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));

            expect(valuesAddBlock.queryByRole('button', {name: /advanced_search/})).not.toBeInTheDocument();
        });

        test('Can search elements and add them', async () => {
            const mocks = [
                {
                    request: {
                        query: getRecordsFromLibraryQuery([], true),
                        variables: {
                            library: 'test_lib',
                            fullText: 'a',
                            limit: 10,
                            offset: 0
                        }
                    },
                    result: {
                        data: {
                            records: {
                                __typename: 'TestLibList',
                                totalCount: 1,
                                list: [
                                    {
                                        __typename: 'TestLib',
                                        _id: '2401',
                                        id: '2401',
                                        whoAmI: {
                                            __typename: 'RecordIdentity',
                                            id: '2401',
                                            label: 'label0',
                                            subLabel: 'label0',
                                            color: null,
                                            preview: null,
                                            library: {
                                                __typename: 'Library',
                                                ...mockLibrarySimple
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            ];

            const mockOnAddValue = jest.fn().mockReturnValue({
                status: APICallStatus.SUCCESS,
                value: {
                    id_value: null,
                    value: 'My value',
                    raw_value: 'My value'
                }
            });

            jest.spyOn(useSaveValueBatchMutation, 'default').mockImplementation(() => ({
                ...useSaveValueBatchMutation.default(),
                saveValues: mockOnAddValue
            }));

            _renderLinkField(
                {
                    element: {...mockFormElementLinkMultivalue},
                    onValueSubmit: mockHandleSubmit,
                    onValueDelete: mockHandleDelete,
                    onDeleteMultipleValues: jest.fn()
                },
                {
                    mocks,
                    cacheSettings: {
                        possibleTypes: {
                            Record: ['TestLib']
                        }
                    }
                }
            );

            const addValueBtn = screen.getByRole('button', {name: /add/, hidden: true});
            await userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));

            const searchInput = valuesAddBlock.getByRole('textbox', {name: /search_elements/});
            expect(searchInput).toBeInTheDocument();

            await userEvent.click(searchInput);

            await userEvent.type(searchInput, 'a{enter}', {delay: 5});

            expect(await valuesAddBlock.findByText('label0')).toBeInTheDocument();
        });

        test('Can add an element via creation', async () => {
            _renderLinkField({
                element: {...mockFormElementLinkMultivalue},
                onValueSubmit: mockHandleSubmit,
                onValueDelete: mockHandleDelete,
                onDeleteMultipleValues: jest.fn()
            });

            const addValueBtn = screen.getByRole('button', {name: /add/, hidden: true});
            await userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));
            await userEvent.click(valuesAddBlock.getByRole('button', {name: /new_record/}));

            expect(screen.getByText('EditRecord')).toBeInTheDocument();
        });
    });
});
