// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {
    EditRecordReducerActionsTypes,
    initialState
} from 'components/RecordEdition/editRecordReducer/editRecordReducer';
import * as useEditRecordReducer from 'components/RecordEdition/editRecordReducer/useEditRecordReducer';
import {getRecordsFromLibraryQuery} from 'graphQL/queries/records/getRecordsFromLibraryQuery';
import {IUseGetRecordColumnsValuesQueryHook} from 'hooks/useGetRecordColumnsValuesQuery/useGetRecordColumnsValuesQuery';
import React from 'react';
import {SortOrder} from '_gqlTypes/globalTypes';
import {
    RECORD_FORM_recordForm_elements_attribute_LinkAttribute,
    RECORD_FORM_recordForm_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI
} from '_gqlTypes/RECORD_FORM';
import {act, render, screen, within} from '_tests/testUtils';
import {mockAttributeLink} from '__mocks__/common/attribute';
import {mockFormElementLink, mockLinkValue} from '__mocks__/common/form';
import {mockRecordWhoAmI} from '__mocks__/common/record';
import {mockModifier} from '__mocks__/common/value';
import * as useSaveValueBatchMutation from '../../hooks/useSaveValueBatchMutation';
import {APICallStatus, DeleteValueFunc, FormElement, ISubmitMultipleResult, SubmitValueFunc} from '../../_types';
import LinkField from './LinkField';

jest.mock('hooks/LangHook/LangHook');

jest.mock('components/SearchModal', () => {
    return function SearchModal() {
        return <div>SearchModal</div>;
    };
});

jest.mock('hooks/useGetRecordColumnsValuesQuery/useGetRecordColumnsValuesQuery', () => ({
    useGetRecordColumnsValuesQuery: (): Partial<IUseGetRecordColumnsValuesQueryHook> => ({
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
                        ...mockRecordWhoAmI
                    }
                }
            }
        ]
    };
    const mockHandleSubmit: SubmitValueFunc = jest.fn().mockReturnValue(mockSubmitRes);
    const mockHandleDelete: DeleteValueFunc = jest.fn().mockReturnValue({status: APICallStatus.SUCCESS});

    beforeEach(() => jest.clearAllMocks());

    test('Display list of values', async () => {
        await act(async () => {
            render(
                <LinkField
                    element={mockFormElementLink}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(1);
    });

    test('Display list of values with configured columns', async () => {
        const mockFormElementLinkWithColumns = {
            ...mockFormElementLink,
            settings: {
                ...mockFormElementLink.settings,
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

        await act(async () => {
            render(
                <LinkField
                    element={{...mockFormElementLinkWithColumns, values: recordValuesWithColumns}}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('cell')).toHaveLength(3);
        expect(screen.getByText('col1 value')).toBeInTheDocument();
        expect(screen.getByText('col2 value')).toBeInTheDocument();
    });

    test('If no value, display a button to add a value', async () => {
        await act(async () => {
            render(
                <LinkField
                    element={{...mockFormElementLink, values: []}}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        expect(screen.getAllByRole('table').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByRole('button', {name: /add/, hidden: true})).toBeInTheDocument();
    });

    test('If no value and cannot add, display a message', async () => {
        await act(async () => {
            render(
                <LinkField
                    element={{
                        ...mockFormElementLink,
                        attribute: {...mockFormElementLink.attribute, system: true},
                        values: []
                    }}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        expect(screen.getByText('record_edition.no_value')).toBeInTheDocument();
    });

    test('Can edit and delete linked record', async () => {
        await act(async () => {
            render(
                <LinkField
                    element={mockFormElementLink}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        const row = screen.getByRole('row', {name: /record/});
        userEvent.hover(row, null);

        expect(screen.queryByRole('button', {name: /delete/, hidden: true})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: 'edit-record', hidden: true})).toBeInTheDocument();
    });

    test('If multiple values, display add value button', async () => {
        const mockFormElementLinkMultivalue: FormElement<{}> = {
            ...mockFormElementLink,
            attribute: {
                ...mockFormElementLink.attribute,
                multiple_values: true
            }
        };
        await act(async () => {
            render(
                <LinkField
                    element={mockFormElementLinkMultivalue}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

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

        await act(async () => {
            render(
                <LinkField
                    element={mockFormElementLinkNoMultivalue}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        expect(screen.queryByRole('button', {name: /add/, hidden: true})).not.toBeInTheDocument();
    });

    test('Can display value details', async () => {
        await act(async () => {
            render(
                <LinkField
                    element={mockFormElementLink}
                    record={mockRecordWhoAmI}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        const valueDetailsButton = screen.getByRole('button', {name: /info/, hidden: true});
        expect(valueDetailsButton).toBeInTheDocument();

        userEvent.click(valueDetailsButton);

        expect(mockEditRecordDispatch.mock.calls[0][0].type).toBe(EditRecordReducerActionsTypes.SET_ACTIVE_VALUE);
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
            await act(async () => {
                render(
                    <LinkField
                        element={mockFormElementLinkMultivalue}
                        record={mockRecordWhoAmI}
                        onValueSubmit={mockHandleSubmit}
                        onValueDelete={mockHandleDelete}
                    />
                );
            });

            const addValueBtn = screen.getByRole('button', {name: /add/, hidden: true});
            userEvent.click(addValueBtn);

            const valuesAddBlock = within(screen.getByTestId('values-add'));

            const valuesListElem = valuesAddBlock.getByText(mockRecordWhoAmI.label);
            expect(valuesListElem).toBeInTheDocument();

            await act(async () => {
                userEvent.click(valuesListElem);
            });

            expect(mockHandleSubmit).toBeCalledWith([
                {
                    attribute: {...mockFormElementLinkMultivalue.attribute},
                    idValue: null,
                    value: {id: mockRecordWhoAmI.id, whoAmI: mockRecordWhoAmI}
                }
            ]);
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
            await act(async () => {
                render(
                    <LinkField
                        element={mockFormElementLinkValuesList}
                        record={mockRecordWhoAmI}
                        onValueSubmit={mockHandleSubmit}
                        onValueDelete={mockHandleDelete}
                    />
                );
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

            await act(async () => {
                render(
                    <LinkField
                        element={mockFormElementLinkMultivalue}
                        record={mockRecordWhoAmI}
                        onValueSubmit={mockHandleSubmit}
                        onValueDelete={mockHandleDelete}
                    />
                );
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
            await act(async () => {
                render(
                    <LinkField
                        element={mockFormElementLinkMultivalue}
                        record={mockRecordWhoAmI}
                        onValueSubmit={mockHandleSubmit}
                        onValueDelete={mockHandleDelete}
                    />
                );
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
            await act(async () => {
                render(
                    <LinkField
                        element={mockFormElementLinkMultivalue}
                        record={mockRecordWhoAmI}
                        onValueSubmit={mockHandleSubmit}
                        onValueDelete={mockHandleDelete}
                    />
                );
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

            await act(async () => {
                render(
                    <LinkField
                        element={mockFormElementLinkMultivalueNoFreeEntry}
                        record={mockRecordWhoAmI}
                        onValueSubmit={mockHandleSubmit}
                        onValueDelete={mockHandleDelete}
                    />
                );
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
                        query: getRecordsFromLibraryQuery('test_lib'),
                        variables: {
                            fullText: 'a',
                            limit: 10,
                            offset: 0,
                            sortOrder: SortOrder.asc
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
                                            color: null,
                                            preview: null,
                                            library: {
                                                __typename: 'Library',
                                                id: 'test_lib',
                                                label: {
                                                    fr: 'Test'
                                                },
                                                gqlNames: {
                                                    __typename: 'LibraryGraphqlNames',
                                                    query: 'test_lib',
                                                    type: 'TestLib'
                                                }
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

            await act(async () => {
                render(
                    <LinkField
                        element={mockFormElementLinkMultivalue}
                        record={mockRecordWhoAmI}
                        onValueSubmit={mockHandleSubmit}
                        onValueDelete={mockHandleDelete}
                    />,
                    {
                        apolloMocks: mocks,
                        cacheSettings: {
                            possibleTypes: {
                                Record: ['TestLib']
                            }
                        }
                    }
                );
            });

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

            await new Promise(resolve => setTimeout(resolve, 0));

            expect(valuesAddBlock.getByText('label0')).toBeInTheDocument();
        });
    });
});
