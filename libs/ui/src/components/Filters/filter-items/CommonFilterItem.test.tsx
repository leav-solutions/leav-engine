// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, within, waitFor} from '_ui/_tests/testUtils';
import {CommonFilterItem} from './CommonFilterItem';
import * as gqlTypes from '_ui/_gqlTypes';
import {AttributeType, RecordFilterCondition, type TreeDataQueryQueryHookResult} from '_ui/_gqlTypes';
import {AttributeConditionFilter} from '_ui/types';
import {type FunctionComponent, useReducer} from 'react';
import dayjs from 'dayjs';
import {conditionsByFormat} from '../filter-items/filter-type/useConditionOptionsByType';
import userEvent from '@testing-library/user-event';
import {type Mockify} from '@leav/utils';
import {filtersReducer as filtersReducerBase, type IUIFiltersState} from '../context/filtersReducer';
import {FiltersContext} from '../context/filtersContext';
import {useFiltersContext} from '../useFiltersContext';
import {type IUIFilterStandardValueList, type IUIFilterValueList, type UIFilter} from '../_types';
import {filtersInitialState} from '../context/filtersInitialState';

const getAllConditionOptions = (base: ReturnType<typeof render>['baseElement']) =>
    base.getElementsByClassName('rc-virtual-list')[0].getElementsByClassName('kit-select-option');

const filtersReducer = filtersReducerBase(null);

const MockFiltersContextProvider: FunctionComponent<{viewMock: IUIFiltersState}> = ({viewMock, children}) => {
    const [filtersData, dispatch] = useReducer(filtersReducer, viewMock);
    return <FiltersContext.Provider value={{filtersData, dispatch}}>{children}</FiltersContext.Provider>;
};

const CommonFilterItemContainer: FunctionComponent = () => {
    const {
        filtersData: {filters},
    } = useFiltersContext();
    return <CommonFilterItem filter={filters[0]} />;
};

describe('CommonFilterItem', () => {
    describe('numeric filter', () => {
        test('should render numeric filter', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'numeric filter',
                    id: 'numeric filter',
                    format: gqlTypes.AttributeFormat.numeric,
                    type: AttributeType.simple,
                },
                field: 'test',
                value: '1',
                condition: AttributeConditionFilter.EQUAL,
            };

            render(<CommonFilterItem filter={filter} />);
            await userEvent.click(screen.getByRole('button', {name: /numeric/}));
            const inputNumber = screen.getByRole('spinbutton');
            expect(inputNumber).toBeVisible();
            expect(inputNumber).toHaveValue(filter.value);
        });

        test('should not render numeric input if condition is IS_EMPTY', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'numeric filter',
                    id: 'numeric filter',
                    format: gqlTypes.AttributeFormat.numeric,
                    type: AttributeType.simple,
                },
                field: 'test',
                value: '1',
                condition: AttributeConditionFilter.EQUAL,
            };

            render(
                <MockFiltersContextProvider viewMock={{...filtersInitialState, filters: [filter]}}>
                    <CommonFilterItemContainer />
                </MockFiltersContextProvider>,
            );
            await userEvent.click(screen.getByRole('button', {name: /numeric/}));
            expect(screen.queryByRole('spinbutton')).toBeInTheDocument();

            const select = screen.getByRole('combobox');
            await userEvent.click(select);

            const option = screen.getByText(/is-empty/);
            await userEvent.click(option);

            expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
        });
    });

    describe('text filter', () => {
        test('should render text filter', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'text filter',
                    id: 'text filter',
                    format: gqlTypes.AttributeFormat.text,
                    type: AttributeType.simple,
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.EQUAL,
            };

            const {baseElement} = render(<CommonFilterItem filter={filter} />);
            await userEvent.click(screen.getByRole('button', {name: /text/}));

            // Wait for any pending debounced updates to settle
            await waitFor(() => {
                const textInput = screen.getByRole('textbox');
                expect(textInput).toHaveValue(filter.value);
            });

            const textInput = screen.getByRole('textbox');
            expect(textInput).toBeVisible();

            const select = screen.getByRole('combobox');
            await userEvent.click(select);
            const options = getAllConditionOptions(baseElement);
            expect(options).toHaveLength(conditionsByFormat[gqlTypes.AttributeFormat.text].length);
        });

        test('should not render text input if condition is IS_EMPTY', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'text filter',
                    id: 'text filter',
                    format: gqlTypes.AttributeFormat.text,
                    type: AttributeType.simple,
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.EQUAL,
            };

            render(
                <MockFiltersContextProvider viewMock={{...filtersInitialState, filters: [filter]}}>
                    <CommonFilterItemContainer />
                </MockFiltersContextProvider>,
            );
            await userEvent.click(screen.getByRole('button', {name: /text/}));

            await waitFor(() => {
                expect(screen.queryByRole('textbox')).toBeInTheDocument();
            });

            const select = screen.getByRole('combobox');
            await userEvent.click(select);

            const option = screen.getByText(/is-empty/);
            await userEvent.click(option);

            await waitFor(() => {
                expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
            });
        });
    });

    describe('rich text filter', () => {
        test('should render rich text filter', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'rich text filter',
                    id: 'rich text filter',
                    format: gqlTypes.AttributeFormat.rich_text,
                    type: AttributeType.simple,
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.EQUAL,
            };

            const {baseElement} = render(<CommonFilterItem filter={filter} />);
            await userEvent.click(screen.getByRole('button', {name: /rich text/}));

            await waitFor(() => {
                const textInput = screen.getByRole('textbox');
                expect(textInput).toHaveValue(filter.value);
            });

            const textInput = screen.getByRole('textbox');
            expect(textInput).toBeVisible();

            const select = screen.getByRole('combobox');
            await userEvent.click(select);
            const options = getAllConditionOptions(baseElement);
            expect(options).toHaveLength(conditionsByFormat[gqlTypes.AttributeFormat.rich_text].length);
        });

        test('should not render rich text input if condition is IS_EMPTY', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'rich text filter',
                    id: 'rich text filter',
                    format: gqlTypes.AttributeFormat.rich_text,
                    type: AttributeType.simple,
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.EQUAL,
            };

            render(
                <MockFiltersContextProvider viewMock={{...filtersInitialState, filters: [filter]}}>
                    <CommonFilterItemContainer />
                </MockFiltersContextProvider>,
            );
            await userEvent.click(screen.getByRole('button', {name: /rich text/}));

            await waitFor(() => {
                expect(screen.queryByRole('textbox')).toBeInTheDocument();
            });

            const select = screen.getByRole('combobox');
            await userEvent.click(select);

            const option = screen.getByText(/is-empty/);
            await userEvent.click(option);

            await waitFor(() => {
                expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
            });
        });
    });

    describe('boolean filter', () => {
        test('should render boolean filter', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'boolean filter',
                    id: 'boolean filter',
                    format: gqlTypes.AttributeFormat.boolean,
                    type: AttributeType.simple,
                },
                field: 'test',
                value: 'true',
                condition: AttributeConditionFilter.EQUAL,
            };

            render(<CommonFilterItem filter={filter} />);
            await userEvent.click(screen.getByRole('button', {name: /boolean/}));
            expect(screen.getByText(/true/)).toBeVisible();
        });

        test('should handle active attribute with default value and no reset action', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'Active',
                    id: 'active',
                    format: gqlTypes.AttributeFormat.boolean,
                    type: AttributeType.simple,
                },
                field: 'active',
                value: null,
                condition: AttributeConditionFilter.EQUAL,
            };

            render(
                <MockFiltersContextProvider viewMock={{...filtersInitialState, filters: [filter]}}>
                    <CommonFilterItemContainer />
                </MockFiltersContextProvider>,
            );

            await userEvent.click(screen.getByRole('button', {name: /Active/}));

            expect(screen.getByText(/explorer.true/)).toBeVisible();
            expect(screen.queryByRole('button', {name: /reset/i})).not.toBeInTheDocument();
        });
    });

    describe('date filter', () => {
        const date = {unix: '1730761200', formatted: dayjs.unix(1730761200).format('YYYY-MM-DD')};

        test('should render simple filter', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'date filter',
                    id: 'date filter',
                    format: gqlTypes.AttributeFormat.date,
                    type: AttributeType.simple,
                },
                field: 'test',
                value: date.unix,
                condition: AttributeConditionFilter.EQUAL,
            };

            render(<CommonFilterItem filter={filter} />);
            await userEvent.click(screen.getByRole('button', {name: /date/}));
            const textInput = screen.getByRole('textbox');
            expect(textInput).toBeVisible();
            expect(textInput).toHaveValue(date.formatted);
        });

        test('should render an DateRangePicker if condition is BETWEEN', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'date filter',
                    id: 'date filter',
                    format: gqlTypes.AttributeFormat.date,
                    type: AttributeType.simple,
                },
                field: 'test',
                value: date.unix,
                condition: AttributeConditionFilter.EQUAL,
            };

            render(
                <MockFiltersContextProvider viewMock={{...filtersInitialState, filters: [filter]}}>
                    <CommonFilterItemContainer />
                </MockFiltersContextProvider>,
            );
            await userEvent.click(screen.getByRole('button', {name: /date/}));
            expect(screen.queryByRole('textbox')).toBeInTheDocument();

            const select = screen.getByRole('combobox');
            await userEvent.click(select);

            const emptyOption = screen.getAllByText(/between/).pop()!;
            await userEvent.click(emptyOption);

            expect(screen.queryAllByRole('textbox').length).toBe(2);
        });
    });

    describe('color filter', () => {
        test('should render color filter', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'color filter',
                    id: 'color filter',
                    format: gqlTypes.AttributeFormat.color,
                    type: AttributeType.simple,
                },
                field: 'test',
                value: null,
                condition: null,
            };

            render(<CommonFilterItem filter={filter} />);
            expect(screen.getByRole('button', {name: /color/})).toBeVisible();
        });
    });

    describe('encrypted filter', () => {
        test('should render encrypted filter', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'encrypted filter',
                    id: 'encrypted filter',
                    format: gqlTypes.AttributeFormat.encrypted,
                    type: AttributeType.simple,
                },
                field: 'test',
                value: null,
                condition: null,
            };

            render(<CommonFilterItem filter={filter} />);
            await userEvent.click(screen.getByRole('button', {name: /encrypted/}));
            expect(await screen.findByText(/select-condition/)).toBeVisible();
        });
    });

    describe('extended filter', () => {
        test('should render extended filter', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'extended filter',
                    id: 'extended filter',
                    format: gqlTypes.AttributeFormat.extended,
                    type: AttributeType.simple,
                },
                field: 'test',
                value: null,
                condition: null,
            };

            render(<CommonFilterItem filter={filter} />);
            await userEvent.click(screen.getByRole('button', {name: /extended/}));
            expect(await screen.findByText(/select-condition/)).toBeVisible();
        });
    });

    describe('period filter', () => {
        test('should render period filter', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'period filter',
                    id: 'period filter',
                    format: gqlTypes.AttributeFormat.date_range,
                    type: AttributeType.simple,
                },
                field: 'test',
                value: null,
                condition: null,
            };

            render(<CommonFilterItem filter={filter} />);
            await userEvent.click(screen.getByRole('button', {name: /period/}));
            expect(await screen.findByText(/select-condition/)).toBeVisible();
        });
    });

    describe('link filter', () => {
        test('should behave like a text filter', async () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'link filter',
                    id: 'link filter',
                    type: AttributeType.advanced_link,
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.EQUAL,
            };

            const {baseElement} = render(<CommonFilterItem filter={filter} />);
            await userEvent.click(screen.getByRole('button', {name: /link/}));

            await waitFor(() => {
                const textInput = screen.getByRole('textbox');
                expect(textInput).toHaveValue(filter.value);
            });

            const textInput = screen.getByRole('textbox');
            expect(textInput).toBeVisible();

            const select = screen.getByRole('combobox');
            await userEvent.click(select);
            const options = getAllConditionOptions(baseElement);
            expect(options).toHaveLength(
                conditionsByFormat[gqlTypes.AttributeFormat.text].filter(f => f !== AttributeConditionFilter.NOT_EQUAL) // disable NOT_EQUAL for now because of backend condition filter issue
                    .length + 1,
            ); // + 1 for "through" condition
        });

        test('should handle "through" condition', async () => {
            // GIVEN a link filter with a through condition
            const mockLinkedAttribute = {
                id: 'linked_attribute',
                label: {fr: 'Linked Attribute'},
                type: AttributeType.simple,
                format: gqlTypes.AttributeFormat.text,
            };

            const mockUseGetLibraryAttributesLazyQuery = [
                jest.fn(),
                {
                    loading: false,
                    data: {
                        libraries: {
                            list: [
                                {
                                    id: 'link_library',
                                    attributes: [mockLinkedAttribute],
                                },
                            ],
                        },
                    },
                },
            ];

            jest.spyOn(gqlTypes, 'useGetLibraryAttributesLazyQuery').mockReturnValue(
                mockUseGetLibraryAttributesLazyQuery as gqlTypes.GetLibraryAttributesLazyQueryHookResult,
            );

            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'link filter',
                    id: 'link filter',
                    type: AttributeType.advanced_link,
                    linkedLibrary: {
                        id: 'link_library',
                    },
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.THROUGH,
                subCondition: null,
                subField: null,
            };

            // WHEN the filter dropdown is displayed
            const {baseElement} = render(
                <MockFiltersContextProvider viewMock={{...filtersInitialState, filters: [filter]}}>
                    <CommonFilterItem filter={filter} />
                </MockFiltersContextProvider>,
            );
            await userEvent.click(screen.getByRole('button', {name: /link/}));

            // THEN the "through" condition should be selected
            const conditionSelect = screen.getByRole('combobox', {name: /filter-link-condition/});
            await userEvent.click(conditionSelect);
            const throughOption = screen.getByRole('option', {name: /through/i});
            expect(throughOption).toHaveAttribute('aria-selected', 'true');
            await userEvent.click(throughOption);

            // AND the subField select is available
            await waitFor(() => {
                const subFieldSelect = screen.getByRole('combobox', {name: /link-attribute/});
                expect(subFieldSelect).toBeInTheDocument();
            });

            const subFieldSelect = screen.getByRole('combobox', {name: /link-attribute/});

            // WHEN the user select a link attribute
            await userEvent.click(subFieldSelect);
            const linkAttributeOption = screen.getByText(mockLinkedAttribute.label.fr);
            expect(linkAttributeOption).toBeVisible();
            await userEvent.click(linkAttributeOption);

            // THEN the sub condition dropdown should be displayed
            await waitFor(() => {
                const subConditionSelect = screen.getByRole('combobox', {name: /filter-condition/});
                expect(subConditionSelect).toBeInTheDocument();
            });

            const subConditionSelect = screen.getByRole('combobox', {name: /filter-condition/});

            // WHEN the user select a sub condition
            await userEvent.click(subConditionSelect);
            const subConditionSelectVirtualList = baseElement
                .getElementsByClassName('rc-virtual-list')
                .item(2) as HTMLElement;
            expect(subConditionSelectVirtualList).toBeVisible();
            await userEvent.click(within(subConditionSelectVirtualList).getByText('filters.not-contains'));

            // THEN the value textbox is displayed
            await waitFor(() => {
                expect(screen.queryByRole('textbox')).toBeInTheDocument();
            });
        });
    });

    describe('tree filter', () => {
        it('should render tree filter', async () => {
            const mockUseTreeDataQueryQuery: Mockify<typeof gqlTypes.useTreeDataQueryQuery> = {
                data: {
                    trees: {
                        list: [
                            {
                                id: 'tree_library',
                                label: {
                                    fr: 'Mon arbre',
                                    en: 'My tree',
                                },
                            },
                        ],
                    },
                },
            };

            jest.spyOn(gqlTypes, 'useTreeDataQueryQuery').mockReturnValue(
                mockUseTreeDataQueryQuery as TreeDataQueryQueryHookResult,
            );

            const mockResultFromChild = {
                treeNodeChildren: {
                    totalCount: 1,
                    list: [
                        {
                            id: 'my_first_child',
                            record: {
                                id: 'my_first_child',
                                whoAmI: {
                                    label: 'Emile',
                                },
                            },
                        },
                        {
                            id: 'my_second_child',
                            record: {
                                id: 'my_second_child',
                                whoAmI: {
                                    label: 'Jules',
                                },
                            },
                        },
                    ],
                },
            };

            const mockResult: Mockify<gqlTypes.TreeNodeChildrenQueryResult> = {
                called: true,
                loading: false,
            };

            jest.spyOn(gqlTypes, 'useTreeNodeChildrenLazyQuery').mockReturnValue([
                jest.fn().mockImplementation(() => ({data: mockResultFromChild})),
                mockResult as gqlTypes.TreeNodeChildrenQueryResult,
            ]);

            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'tree filter',
                    id: 'tree_filter',
                    type: AttributeType.tree,
                    linkedTree: {
                        id: 'tree_library',
                    },
                },
                field: ['test'],
                value: [],
                condition: AttributeConditionFilter.EQUAL,
            };

            render(<CommonFilterItem filter={filter} />);
            await userEvent.click(screen.getByRole('button', {name: /tree/}));
            expect(screen.getByText(filter.attribute.label)).toBeVisible();

            expect(screen.getByText(mockResultFromChild.treeNodeChildren.list[0].record.whoAmI.label)).toBeVisible();
            expect(screen.getByText(mockResultFromChild.treeNodeChildren.list[1].record.whoAmI.label)).toBeVisible();
        });
    });

    describe('value list filter', () => {
        test('should render standard value list and allow toggling', async () => {
            const filter: IUIFilterStandardValueList = {
                id: 'test',
                attribute: {
                    label: 'text value list',
                    id: 'my_text_attr',
                    format: gqlTypes.AttributeFormat.text,
                    type: AttributeType.simple,
                    valuesList: {
                        enable: true,
                        values: ['Red', 'Blue'],
                    },
                },
                field: 'my_text_attr',
                value: [],
                condition: RecordFilterCondition.EQUAL,
            };

            render(
                <MockFiltersContextProvider viewMock={{...filtersInitialState, filters: [filter]}}>
                    <CommonFilterItemContainer />
                </MockFiltersContextProvider>,
            );
            await userEvent.click(screen.getByRole('button', {name: /text/}));

            // Options from values list should be visible and toggle-able
            expect(await screen.findByText('Red')).toBeVisible();
            expect(screen.getByText('Blue')).toBeVisible();

            const red = screen.getByText('Red');
            expect(red.closest('[role="button"]')).toHaveAttribute('aria-pressed', 'false');
            // Toggle on
            await userEvent.click(red);
            expect(red.closest('[role="button"]')).toHaveAttribute('aria-pressed', 'true');

            // Toggle off
            await userEvent.click(red);
            expect(red.closest('[role="button"]')).toHaveAttribute('aria-pressed', 'false');
        });

        test('should render link value list and display empty values checkbox', async () => {
            const filter: IUIFilterValueList = {
                id: 'test',
                attribute: {
                    label: 'link value list',
                    id: 'link_attr',
                    type: AttributeType.advanced_link,
                    linkedLibrary: {id: 'link_library'},
                    // Mock only the "enable" property as the linked values are fetched live based on the linked library
                    valuesList: {
                        enable: true,
                        linkedValues: [
                            {
                                id: '1',
                                whoAmI: {
                                    id: '1',
                                    label: 'Alpha',
                                    library: {
                                        id: 'link_library',
                                    },
                                },
                            },
                            {
                                id: '2',
                                whoAmI: {
                                    id: '2',
                                    label: 'Beta',
                                    library: {
                                        id: 'link_library',
                                    },
                                },
                            },
                        ],
                    },
                },
                field: 'link_attr',
                value: [],
                condition: 'EQUAL' as RecordFilterCondition.EQUAL,
            };

            render(
                <MockFiltersContextProvider viewMock={{...filtersInitialState, filters: [filter]}}>
                    <CommonFilterItemContainer />
                </MockFiltersContextProvider>,
            );
            await userEvent.click(screen.getByRole('button', {name: /link/}));

            expect(await screen.findByText('explorer.empty_value')).toBeVisible();

            // Linked values visible and selectable
            const alpha = await screen.findByText('Alpha');
            expect(alpha).toBeVisible();
            const beta = screen.getByText('Beta');
            expect(beta).toBeVisible();

            await userEvent.click(alpha);
            expect(alpha.closest('[role="button"]')).toHaveAttribute('aria-pressed', 'true');
        });
    });
});
