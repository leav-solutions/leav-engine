import * as apolloClient from '@apollo/client';
import {render, screen, within, waitFor} from '_ui/_tests/testUtils';
import {CommonFilterItem} from './CommonFilterItem';
import * as gqlTypes from '_ui/_gqlTypes';
import {AttributeType, RecordFilterCondition, type TreeDataQueryQueryHookResult} from '_ui/_gqlTypes';
import {AttributeConditionFilter} from '_ui/types';
import {type FunctionComponent, type PropsWithChildren, useReducer} from 'react';
import dayjs from 'dayjs';
import {conditionsByFormat} from '../filter-items/filter-type/useConditionOptionsByType';
import userEvent from '@testing-library/user-event';
import {type Mockify} from '_ui/__mocks__/utils';
import {filtersReducer as filtersReducerBase, type IUIFiltersState} from '../context/filtersReducer';
import {FiltersContext} from '../context/filtersContext';
import {useFiltersContext} from '../useFiltersContext';
import {
    type IUIFilterStandard,
    type IUIFilterStandardValueList,
    type IUIFilterValueList,
    type UIFilter,
} from '../_types';
import {filtersInitialState} from '../context/filtersInitialState';
import {LangContext} from '_ui/contexts';

const enLangContext = {lang: ['en'], availableLangs: ['fr', 'en'], defaultLang: 'en', setLang: () => undefined};

const getAllConditionOptions = (base: ReturnType<typeof render>['baseElement']) =>
    base.getElementsByClassName('rc-virtual-list')[0].getElementsByClassName('kit-select-option');

const filtersReducer = filtersReducerBase(null);

const MockFiltersContextProvider: FunctionComponent<PropsWithChildren<{viewMock: IUIFiltersState}>> = ({
    viewMock,
    children,
}) => {
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
            await waitFor(() => expect(inputNumber).toBeVisible());
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
            await waitFor(() => expect(textInput).toBeVisible());

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
            await waitFor(() => expect(textInput).toBeVisible());

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
            await waitFor(() => expect(screen.getByText(/true/)).toBeVisible());
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

            const trueLabels = screen.getAllByText(/explorer.true/);
            expect(trueLabels.length).toBeGreaterThan(0);
            expect(screen.queryByRole('button', {name: /reset/i})).not.toBeInTheDocument();
        });
    });

    describe('date filter', () => {
        const date = {unix: '1730761200', formatted: dayjs.unix(1730761200).format('DD/MM/YYYY')};

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
            await waitFor(() => expect(textInput).toBeVisible());
            expect(textInput).toHaveValue(date.formatted);
        });

        test('should render simple filter formatted MM/DD/YYYY when the current language is english', async () => {
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
                <LangContext.Provider value={enLangContext}>
                    <CommonFilterItem filter={filter} />
                </LangContext.Provider>,
            );
            await userEvent.click(screen.getByRole('button', {name: /date/}));
            const textInput = screen.getByRole('textbox');
            await waitFor(() => expect(textInput).toBeVisible());
            expect(textInput).toHaveValue(dayjs.unix(1730761200).format('MM/DD/YYYY'));
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

            const betweenOption = screen.getAllByText(/between/).pop()!;
            await userEvent.click(betweenOption);

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
            await waitFor(() => expect(screen.getByText(/select-condition/)).toBeVisible());
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
            await waitFor(() => expect(screen.getByText(/select-condition/)).toBeVisible());
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
            await waitFor(() => expect(screen.getByText(/select-condition/)).toBeVisible());
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
            await waitFor(() => expect(textInput).toBeVisible());

            const select = screen.getByRole('combobox');
            await userEvent.click(select);
            const options = getAllConditionOptions(baseElement);
            expect(options).toHaveLength(
                conditionsByFormat[gqlTypes.AttributeFormat.text].filter(
                    f => f !== AttributeConditionFilter.NOT_EQUAL,
                ) // disable NOT_EQUAL for now because of backend condition filter issue
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
                vi.fn(),
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

            vi.spyOn(gqlTypes, 'useGetLibraryAttributesLazyQuery').mockReturnValue(
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
            // antd 6 renamed the Select selected-value class ant-select-selection-item → ant-select-content
            const throughSelectionLabel = baseElement.querySelector('[class*="ant-select-content"]');
            expect(throughSelectionLabel?.textContent).toMatch(/through/i);

            // AND the subField select is available
            await waitFor(() => {
                const subFieldSelect = screen.getByRole('combobox', {name: /link-attribute/});
                expect(subFieldSelect).toBeInTheDocument();
            });

            const subFieldSelect = screen.getByRole('combobox', {name: /link-attribute/});

            // WHEN the user select a link attribute
            await userEvent.click(subFieldSelect);
            const linkAttributeOption = screen.getByText(mockLinkedAttribute.label.fr);
            await waitFor(() => expect(linkAttributeOption).toBeVisible());
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
                .item(1) as HTMLElement;
            await waitFor(() => expect(subConditionSelectVirtualList).toBeVisible());
            await userEvent.click(within(subConditionSelectVirtualList).getByText('filters.not-contains'));

            // THEN the value textbox is displayed
            await waitFor(() => {
                expect(screen.queryByRole('textbox')).toBeInTheDocument();
            });
        });
    });

    describe('through filter chip', () => {
        test('renders a counting badge instead of the raw value in text', () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'link filter',
                    id: 'link_attr',
                    type: AttributeType.advanced_link,
                    linkedLibrary: {id: 'link_library'},
                },
                field: 'link_attr',
                value: 'test value',
                condition: AttributeConditionFilter.THROUGH,
                subCondition: AttributeConditionFilter.EQUAL,
                subField: 'sub_attr',
            };

            render(<CommonFilterItem filter={filter} />);

            // The chip shows a badge (count) rather than the long value in plain text.
            expect(screen.getByText('1')).toBeVisible();
            expect(screen.queryByText('test value')).not.toBeInTheDocument();
        });

        test('shows the counting badge for a no-value sub-condition (IS_EMPTY), which carries no value', () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'link filter',
                    id: 'link_attr',
                    type: AttributeType.advanced_link,
                    linkedLibrary: {id: 'link_library'},
                },
                field: 'link_attr',
                value: null,
                condition: AttributeConditionFilter.THROUGH,
                subCondition: AttributeConditionFilter.IS_EMPTY,
                subField: 'sub_attr',
            };

            render(<CommonFilterItem filter={filter} />);

            // No value on the filter, but the active IS_EMPTY sub-condition must still count as (1).
            expect(screen.getByText('1')).toBeVisible();
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

            vi.spyOn(gqlTypes, 'useTreeDataQueryQuery').mockReturnValue(
                mockUseTreeDataQueryQuery as TreeDataQueryQueryHookResult,
            );

            const mockResultFromChild = {
                treeContent: [
                    {
                        id: 'my_first_child',
                        accessRecordByDefaultPermission: true,
                        record: {
                            id: 'my_first_child',
                            whoAmI: {
                                id: 'my_first_child',
                                label: 'Emile',
                                library: {
                                    id: 'tree_library',
                                },
                            },
                        },
                        children: [],
                    },
                    {
                        id: 'my_second_child',
                        accessRecordByDefaultPermission: true,
                        record: {
                            id: 'my_second_child',
                            whoAmI: {
                                id: 'my_second_child',
                                label: 'Jules',
                                library: {
                                    id: 'tree_library',
                                },
                            },
                        },
                        children: [],
                    },
                ],
            };

            vi.spyOn(apolloClient, 'useLazyQuery').mockReturnValue([
                vi.fn().mockResolvedValue({data: mockResultFromChild}),
                {} as ReturnType<typeof apolloClient.useLazyQuery>[1],
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

            render(
                <MockFiltersContextProvider
                    viewMock={{
                        ...filtersInitialState,
                        libraryId: 'test-library-id',
                        filters: [filter],
                    }}
                >
                    <CommonFilterItemContainer />
                </MockFiltersContextProvider>,
            );
            await userEvent.click(screen.getByRole('button', {name: /tree/}));
            expect(screen.getByText(filter.attribute.label)).toBeVisible();

            const trees = await screen.findAllByRole('tree');
            expect(trees.length).toBeGreaterThan(0);
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
            await waitFor(() => {
                expect(screen.getByText('Red')).toBeVisible();
                expect(screen.getByText('Blue')).toBeVisible();
            });

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

            await waitFor(() => expect(screen.getByText('filters.empty-value')).toBeVisible());

            // Linked values visible and selectable
            const alpha = await screen.findByText('Alpha');
            expect(alpha).toBeVisible();
            const beta = screen.getByText('Beta');
            expect(beta).toBeVisible();

            await userEvent.click(alpha);
            expect(alpha.closest('[role="button"]')).toHaveAttribute('aria-pressed', 'true');
        });
    });

    describe('chip value display (operator prefix)', () => {
        const numericFilter = (condition: RecordFilterCondition): IUIFilterStandard => ({
            id: 'test',
            attribute: {
                label: 'Année',
                id: 'year',
                format: gqlTypes.AttributeFormat.numeric,
                type: AttributeType.simple,
            },
            field: 'year',
            value: '2026',
            condition,
        });

        test.each([
            [AttributeConditionFilter.EQUAL, '= 2026'],
            [AttributeConditionFilter.NOT_EQUAL, '≠ 2026'],
            [AttributeConditionFilter.GREATER_THAN, '> 2026'],
            [AttributeConditionFilter.LESS_THAN, '< 2026'],
        ])('numeric filter with %s shows the value prefixed with its operator symbol', (condition, expected) => {
            render(<CommonFilterItem filter={numericFilter(condition)} />);
            expect(screen.getByText(expected)).toBeVisible();
        });

        test('text filter with CONTAINS shows the translated condition label before the value', () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'text filter',
                    id: 'text_attr',
                    format: gqlTypes.AttributeFormat.text,
                    type: AttributeType.simple,
                },
                field: 'text_attr',
                value: 'hello',
                condition: AttributeConditionFilter.CONTAINS,
            };

            render(<CommonFilterItem filter={filter} />);
            // t() returns the raw i18n key in tests → the label is the "filters.contains" key.
            expect(screen.getByText('filters.contains hello')).toBeVisible();
        });

        test('text filter with EQUAL shows the "=" symbol before the value', () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'text filter',
                    id: 'text_attr',
                    format: gqlTypes.AttributeFormat.text,
                    type: AttributeType.simple,
                },
                field: 'text_attr',
                value: 'hello',
                condition: AttributeConditionFilter.EQUAL,
            };

            render(<CommonFilterItem filter={filter} />);
            expect(screen.getByText('= hello')).toBeVisible();
        });

        test('raw link filter (no values list) shows its value prefixed', () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'link filter',
                    id: 'link_attr',
                    type: AttributeType.advanced_link,
                },
                field: 'link_attr',
                value: 'bar',
                condition: AttributeConditionFilter.EQUAL,
            };

            render(<CommonFilterItem filter={filter} />);
            expect(screen.getByText('= bar')).toBeVisible();
        });

        describe('date filter', () => {
            const dateFilter = (condition: RecordFilterCondition): IUIFilterStandard => ({
                id: 'test',
                attribute: {
                    label: 'date filter',
                    id: 'date_attr',
                    format: gqlTypes.AttributeFormat.date,
                    type: AttributeType.simple,
                },
                field: 'date_attr',
                value: '1730761200',
                formattedValue: '2024-11-04',
                condition,
            });

            test.each([
                [AttributeConditionFilter.EQUAL, '= 2024-11-04'],
                [AttributeConditionFilter.NOT_EQUAL, '≠ 2024-11-04'],
                [AttributeConditionFilter.LESS_THAN, '< 2024-11-04'],
                [AttributeConditionFilter.GREATER_THAN, '> 2024-11-04'],
            ])('with %s shows the formatted value prefixed', (condition, expected) => {
                render(<CommonFilterItem filter={dateFilter(condition)} />);
                expect(screen.getByText(expected)).toBeVisible();
            });
        });

        test('boolean filter shows its value without any operator prefix (non-regression)', () => {
            const filter: UIFilter = {
                id: 'test',
                attribute: {
                    label: 'boolean filter',
                    id: 'bool_attr',
                    format: gqlTypes.AttributeFormat.boolean,
                    type: AttributeType.simple,
                },
                field: 'bool_attr',
                value: 'true',
                formattedValue: 'Oui',
                // BooleanAttributeDropDown stores an EQUAL condition, but the chip must stay unprefixed.
                condition: AttributeConditionFilter.EQUAL,
            };

            render(<CommonFilterItem filter={filter} />);
            expect(screen.getByText('Oui')).toBeVisible();
            expect(screen.queryByText('= Oui')).not.toBeInTheDocument();
        });

        test('link value list shows the label without any operator prefix (non-regression)', async () => {
            const filter: IUIFilterValueList = {
                id: 'test',
                attribute: {
                    label: 'link value list',
                    id: 'link_attr',
                    type: AttributeType.advanced_link,
                    linkedLibrary: {id: 'link_library'},
                    valuesList: {
                        enable: true,
                        linkedValues: [
                            {
                                id: '1',
                                whoAmI: {
                                    id: '1',
                                    label: 'Officiel',
                                    library: {id: 'link_library'},
                                },
                            },
                        ],
                    },
                },
                field: 'link_attr',
                value: ['1'],
                condition: RecordFilterCondition.EQUAL,
            };

            render(<CommonFilterItem filter={filter} />);
            expect(await screen.findByText('Officiel')).toBeVisible();
            expect(screen.queryByText('= Officiel')).not.toBeInTheDocument();
        });
    });
});
