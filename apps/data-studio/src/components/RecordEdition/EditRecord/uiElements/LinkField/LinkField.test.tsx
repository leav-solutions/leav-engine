// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ICommonFieldsSettings} from '@leav/utils';
import userEvent from '@testing-library/user-event';
import {
    EditRecordReducerActionsTypes,
    initialState
} from 'components/RecordEdition/editRecordModalReducer/editRecordModalReducer';
import * as useEditRecordModalReducer from 'components/RecordEdition/editRecordModalReducer/useEditRecordModalReducer';
import {getRecordsFromLibraryQuery} from 'graphQL/queries/records/getRecordsFromLibraryQuery';
import {IUseGetRecordColumnsValuesQueryHook} from 'hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';
import {
    RECORD_FORM_recordForm_elements_attribute_LinkAttribute,
    RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI
} from '_gqlTypes/RECORD_FORM';
import {act, ICustomRenderOptions, render, screen, waitFor, within} from '_tests/testUtils';
import {mockAttributeLink} from '__mocks__/common/attribute';
import {mockFormElementLink, mockLinkValue} from '__mocks__/common/form';
import {mockLibrary} from '__mocks__/common/library';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import {mockModifier} from '__mocks__/common/value';
import {RecordEditionContext} from '../../hooks/useRecordEditionContext';
import * as useSaveValueBatchMutation from '../../hooks/useSaveValueBatchMutation';
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

jest.mock('components/SearchModal', () => {
    return function SearchModal() {
        return <div>SearchModal</div>;
    };
});

jest.mock('components/RecordEdition/EditRecordModal', () => {
    return function EditRecordModal() {
        return <div>EditRecordModal</div>;
    };
});

jest.mock('hooks/useGetRecordValuesQuery/useGetRecordValuesQuery', () => ({
    useGetRecordValuesQuery: (): Partial<IUseGetRecordColumnsValuesQueryHook> => ({
        loading: false,
        data: {
            [mockRecordWhoAmI.id]: {
                _id: null,
                col1: [{value: 'col1 value'}],
                col2: [{value: 'col2 value'}]
            }
        },
        refetch: jest.fn()
    })
}));

jest.mock('hooks/useRefreshFieldValues', () => ({
    useRefreshFieldValues: () => ({
        fetchValues: jest.fn().mockReturnValue([])
    })
}));

describe('LinkField', () => {
    const mockEditRecordModalDispatch = jest.fn();
    jest.spyOn(useEditRecordModalReducer, 'useEditRecordModalReducer').mockImplementation(() => ({
        state: initialState,
        dispatch: mockEditRecordModalDispatch
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
                        ...mockRecordWhoAmI
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
                    record: mockRecordWhoAmI,
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
        _renderLinkField({element: mockFormElementLink});

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

        _renderLinkField({element: {...mockFormElementLinkWithColumns, values: recordValuesWithColumns}});

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('cell')).toHaveLength(3);
        expect(screen.getByText('col1 value')).toBeInTheDocument();
        expect(screen.getByText('col2 value')).toBeInTheDocument();
    });

    test('If no value, display a button to add a value', async () => {
        _renderLinkField({element: {...mockFormElementLink, values: []}});

        expect(screen.getAllByRole('table').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByRole('button', {name: /add/, hidden: true})).toBeInTheDocument();
    });

    test('If no value and cannot add, display a message', async () => {
        _renderLinkField({
            element: {...mockFormElementLink, attribute: {...mockFormElementLink.attribute, readonly: true}, values: []}
        });

        expect(screen.getByText('record_edition.no_value')).toBeInTheDocument();
    });

    test('Can edit and delete linked record', async () => {
        _renderLinkField({element: {...mockFormElementLink}});

        const row = screen.getByRole('row', {name: /record/});
        userEvent.hover(row, null);

        expect(screen.queryByRole('button', {name: /delete-value/, hidden: true})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'edit-record', hidden: true})).toBeInTheDocument();
    });

    test('Can delete all values', async () => {
        _renderLinkField({element: {...mockFormElementLink}});

        const deleteAllValuesButton = screen.getByRole('button', {name: /delete-all-values/, hidden: true});
        expect(deleteAllValuesButton).toBeInTheDocument();

        userEvent.click(deleteAllValuesButton.parentElement);

        await act(async () => {
            userEvent.click(screen.getByRole('button', {name: /confirm/}));
        });

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
        _renderLinkField({element: {...mockFormElementLink}});

        const valueDetailsButtons = screen.getAllByRole('button', {name: /info/, hidden: true});
        expect(valueDetailsButtons).toHaveLength(2);

        userEvent.click(valueDetailsButtons[0]);

        expect(mockEditRecordModalDispatch.mock.calls[0][0].type).toBe(EditRecordReducerActionsTypes.SET_ACTIVE_VALUE);
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
                                ...(mockRecordWhoAmI as RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI)
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
                    values: (mockFormElementLinkMultivalue.attribute as RECORD_FORM_recordForm_elements_attribute_LinkAttribute)
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
            userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));

            const valuesListElem = valuesAddBlock.getByText(mockRecordWhoAmI.label);
            expect(valuesListElem).toBeInTheDocument();

            await act(async () => {
                userEvent.click(valuesListElem);
            });

            expect(mockHandleSubmit).toBeCalledWith(
                [
                    {
                        attribute: {...mockFormElementLinkMultivalue.attribute},
                        idValue: null,
                        value: {id: mockRecordWhoAmI.id, whoAmI: mockRecordWhoAmI}
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
                                    ...(mockRecordWhoAmI as RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI),
                                    label: 'valueA'
                                }
                            },
                            {
                                id: '123457',
                                whoAmI: {
                                    ...(mockRecordWhoAmI as RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI),
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
            userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));
            const valuesListBlock = within(valuesAddBlock.getByTestId('values_list'));
            const valuesList = within(valuesListBlock.getAllByRole('list')[0]);

            expect(valuesList.getAllByRole('listitem')).toHaveLength(2);

            const searchInput = valuesAddBlock.getByRole('textbox', {name: /search_elements/});
            expect(searchInput).toBeInTheDocument();

            await act(async () => {
                userEvent.click(searchInput);
            });

            await act(async () => {
                await userEvent.type(searchInput, 'B{enter}', {delay: 5});
            });

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
            userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));

            const advSearchButton = valuesAddBlock.getByRole('button', {name: /advanced_search/});
            expect(advSearchButton).toBeInTheDocument();

            await act(async () => {
                userEvent.click(advSearchButton);
            });
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
            userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));
            await act(async () => {
                userEvent.click(valuesAddBlock.getByRole('button', {name: 'close'}));
            });
            expect(screen.queryByTestId('values-add')).not.toBeInTheDocument();
        });

        test('If multiple values, can select multiple elements and add them', async () => {
            _renderLinkField({
                element: {...mockFormElementLinkMultivalue},
                onValueSubmit: mockHandleSubmit,
                onValueDelete: mockHandleDelete,
                onDeleteMultipleValues: jest.fn()
            });

            const addValueBtn = screen.getByRole('button', {name: /add/, hidden: true});
            userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));

            const itemsCheckboxes = valuesAddBlock.getAllByRole('checkbox');
            await act(async () => {
                for (const itemCheckbox of itemsCheckboxes) {
                    userEvent.click(itemCheckbox);
                }
            });

            const submitBtn = valuesAddBlock.getByRole('button', {name: 'global.submit'});
            await act(async () => {
                userEvent.click(submitBtn);
            });

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
            userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));

            expect(valuesAddBlock.queryByRole('button', {name: /advanced_search/})).not.toBeInTheDocument();
        });

        test('Can search elements and add them', async () => {
            const mocks = [
                {
                    request: {
                        query: getRecordsFromLibraryQuery('test_lib', [], true),
                        variables: {
                            fullText: 'a',
                            limit: 10,
                            offset: 0
                        }
                    },
                    result: {
                        data: {
                            test_lib: {
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
                                                ...mockLibrary
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
                    apolloMocks: mocks,
                    cacheSettings: {
                        possibleTypes: {
                            Record: ['TestLib']
                        }
                    }
                }
            );

            const addValueBtn = screen.getByRole('button', {name: /add/, hidden: true});
            await act(async () => {
                userEvent.click(addValueBtn);
            });

            const valuesAddBlock = within(screen.getByTestId('values-add'));

            const searchInput = valuesAddBlock.getByRole('textbox', {name: /search_elements/});
            expect(searchInput).toBeInTheDocument();

            await act(async () => {
                userEvent.click(searchInput);
            });

            await act(async () => {
                await userEvent.type(searchInput, 'a{enter}', {delay: 5});
            });

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
            userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));
            userEvent.click(valuesAddBlock.getByRole('button', {name: /new_record/}));

            expect(screen.getByText('EditRecordModal')).toBeInTheDocument();
        });
    });
});
