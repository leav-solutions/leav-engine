// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {IRecordPropertyLink} from 'graphQL/queries/records/getRecordPropertiesQuery';
import {getRecordsFromLibraryQuery} from 'graphQL/queries/records/getRecordsFromLibraryQuery';
import React from 'react';
import {
    GET_FORM_forms_list_elements_elements_attribute_LinkAttribute,
    GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI
} from '_gqlTypes/GET_FORM';
import {SortOrder} from '_gqlTypes/globalTypes';
import {act, render, screen, within} from '_tests/testUtils';
import {mockAttributeLink} from '__mocks__/common/attribute';
import {mockFormElementLink} from '__mocks__/common/form';
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

jest.mock('../../shared/ValueDetails', () => {
    return function ValueDetails() {
        return <div>ValueDetails</div>;
    };
});

type ValueListWhoAmI = GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI;

describe('LinkField', () => {
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

    const value: IRecordPropertyLink = {
        linkValue: {
            id: '123456',
            whoAmI: {
                ...mockRecordWhoAmI
            }
        },
        created_at: 123456789,
        modified_at: 123456789,
        created_by: mockModifier,
        modified_by: mockModifier,
        id_value: null
    };

    const recordValues = {
        test_attribute: [value]
    };

    beforeEach(() => jest.clearAllMocks());

    test('Display list of values', async () => {
        await act(async () => {
            render(
                <LinkField
                    element={mockFormElementLink}
                    record={mockRecordWhoAmI}
                    recordValues={recordValues}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(2); // Header is counted here
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
                ]
            }
        };

        const recordValuesWithColumns = {
            ...recordValues,
            test_attribute: [
                {
                    ...value,
                    linkValue: {
                        ...value.linkValue,
                        col1: 'col1 value',
                        col2: 'col2 value'
                    }
                }
            ]
        };

        await act(async () => {
            render(
                <LinkField
                    element={mockFormElementLinkWithColumns}
                    record={mockRecordWhoAmI}
                    recordValues={recordValuesWithColumns}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('columnheader')).toHaveLength(3);
        expect(screen.getByText('col1 value')).toBeInTheDocument();
        expect(screen.getByText('col2 value')).toBeInTheDocument();
    });

    test('If no value, display a button to add a value', async () => {
        await act(async () => {
            render(
                <LinkField
                    element={mockFormElementLink}
                    record={mockRecordWhoAmI}
                    recordValues={{test_attribute: []}}
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
                    element={{...mockFormElementLink, attribute: {...mockFormElementLink.attribute, system: true}}}
                    record={mockRecordWhoAmI}
                    recordValues={{test_attribute: []}}
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
                    recordValues={recordValues}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        const recordIdentityCell = screen.getByTestId('whoami-cell');
        userEvent.hover(recordIdentityCell, null);

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
                    recordValues={recordValues}
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
                    recordValues={recordValues}
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
                    recordValues={recordValues}
                    onValueSubmit={mockHandleSubmit}
                    onValueDelete={mockHandleDelete}
                />
            );
        });

        const valueDetailsButton = screen.getByRole('button', {name: /info/, hidden: true});
        expect(valueDetailsButton).toBeInTheDocument();

        userEvent.click(valueDetailsButton);

        expect(screen.getByText('ValueDetails')).toBeInTheDocument();
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
                                ...(mockRecordWhoAmI as GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI)
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
                    values: (mockFormElementLinkMultivalue.attribute as GET_FORM_forms_list_elements_elements_attribute_LinkAttribute)
                        .linkValuesList.values
                }
            }
        };

        test.only('Can add record from values list on click on "add" button', async () => {
            await act(async () => {
                render(
                    <LinkField
                        element={mockFormElementLinkMultivalue}
                        record={mockRecordWhoAmI}
                        recordValues={recordValues}
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
                                    ...(mockRecordWhoAmI as GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI),
                                    label: 'valueA'
                                }
                            },
                            {
                                id: '123457',
                                whoAmI: {
                                    ...(mockRecordWhoAmI as GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linkValuesList_values_whoAmI),
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
                        recordValues={recordValues}
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
                saveValues: mockOnAddValue
            }));

            await act(async () => {
                render(
                    <LinkField
                        element={mockFormElementLinkMultivalue}
                        record={mockRecordWhoAmI}
                        recordValues={recordValues}
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
                        recordValues={recordValues}
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
                        recordValues={recordValues}
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

            expect(mockHandleSubmit).toBeCalledWith([{attribute: 'test', idValue: null, value: mockRecordWhoAmI.id}]);
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
                saveValues: mockOnAddValue
            }));

            await act(async () => {
                render(
                    <LinkField
                        element={mockFormElementLinkMultivalueNoFreeEntry}
                        record={mockRecordWhoAmI}
                        recordValues={recordValues}
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
                                totalCount: 1,
                                list: [
                                    {
                                        _id: '2401',
                                        id: '2401',
                                        whoAmI: {
                                            id: '2401',
                                            label: 'label0',
                                            color: null,
                                            preview: {
                                                small: '',
                                                medium: '',
                                                big: ''
                                            },
                                            library: {
                                                id: 'test_lib',
                                                label: {
                                                    fr: 'Test'
                                                },
                                                gqlNames: {
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
                saveValues: mockOnAddValue
            }));

            await act(async () => {
                render(
                    <LinkField
                        element={mockFormElementLinkMultivalue}
                        record={mockRecordWhoAmI}
                        recordValues={recordValues}
                        onValueSubmit={mockHandleSubmit}
                        onValueDelete={mockHandleDelete}
                    />,
                    {apolloMocks: mocks}
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

        test('Elements are paginated', async () => {
            const mockFormElementLinkForPagination: FormElement<{}> = {
                ...mockFormElementLink,
                attribute: {
                    ...mockFormElementLink.attribute,
                    multiple_values: true,
                    linkValuesList: {
                        enable: true,
                        allowFreeEntry: true,
                        values: [
                            {id: '123451', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI), label: 'first record'}},
                            {id: '123452', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI)}},
                            {id: '123453', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI)}},
                            {id: '123454', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI)}},
                            {id: '123455', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI)}},
                            {id: '123452', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI)}},
                            {id: '123453', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI)}},
                            {id: '123454', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI)}},
                            {id: '123454', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI)}},
                            {id: '123455', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI)}},
                            {id: '123452', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI)}},
                            {id: '123453', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI)}},
                            {id: '123454', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI)}},
                            {id: '123455', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI)}},
                            {id: '123456', whoAmI: {...(mockRecordWhoAmI as ValueListWhoAmI), label: 'last label'}}
                        ]
                    }
                }
            };

            await act(async () => {
                render(
                    <LinkField
                        element={mockFormElementLinkForPagination}
                        record={mockRecordWhoAmI}
                        recordValues={recordValues}
                        onValueSubmit={mockHandleSubmit}
                        onValueDelete={mockHandleDelete}
                    />
                );
            });

            const addValueBtn = screen.getByRole('button', {name: /add/, hidden: true});
            await act(async () => {
                userEvent.click(addValueBtn);
            });

            const valuesAddBlock = within(screen.getByTestId('values-add'));

            expect(valuesAddBlock.getByText('first record')).toBeInTheDocument();

            const nextPageButton = screen.getByRole('button', {name: 'right'});
            await act(async () => {
                userEvent.click(nextPageButton);
            });

            expect(valuesAddBlock.getByText('last label')).toBeInTheDocument();
        });
    });
});
