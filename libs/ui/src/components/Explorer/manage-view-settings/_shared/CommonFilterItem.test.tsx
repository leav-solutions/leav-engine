// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, within} from '_ui/_tests/testUtils';
import {ExplorerFilter} from '../../_types';
import {CommonFilterItem} from './CommonFilterItem';
import * as gqlTypes from '_ui/_gqlTypes';
import {AttributeConditionFilter} from '_ui/types';
import {FunctionComponent, useReducer} from 'react';
import {IViewSettingsState, viewSettingsReducer} from '../store-view-settings/viewSettingsReducer';
import {ViewSettingsContext} from '../store-view-settings/ViewSettingsContext';
import {viewSettingsInitialState} from '../store-view-settings/viewSettingsInitialState';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import dayjs from 'dayjs';
import {conditionsByFormat} from '../filter-items/filter-type/useConditionOptionsByType';
import {AttributeType} from '_ui/_gqlTypes';
import userEvent, {PointerEventsCheckLevel} from '@testing-library/user-event';

const getAllConditionOptions = (base: ReturnType<typeof render>['baseElement']) =>
    base.getElementsByClassName('rc-virtual-list')[0].getElementsByClassName('kit-select-option');

const MockViewSettingsContextProvider: FunctionComponent<{viewMock: IViewSettingsState}> = ({viewMock, children}) => {
    const [view, dispatch] = useReducer(viewSettingsReducer, viewMock);
    return <ViewSettingsContext.Provider value={{view, dispatch}}>{children}</ViewSettingsContext.Provider>;
};

const CommonFilterItemContainer: FunctionComponent = () => {
    const {
        view: {filters}
    } = useViewSettingsContext();
    return <CommonFilterItem filter={filters[0]} />;
};

describe('CommonFilterItem', () => {
    let user;
    beforeEach(() => {
        user = userEvent.setup({
            pointerEventsCheck: PointerEventsCheckLevel.Never
        });
    });

    describe('numeric filter', () => {
        test('should render numeric filter', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'numeric filter',
                    format: gqlTypes.AttributeFormat.numeric,
                    type: AttributeType.simple
                },
                field: 'test',
                value: '1',
                condition: AttributeConditionFilter.EQUAL
            };

            render(<CommonFilterItem filter={filter} />);
            await user.click(screen.getByRole('button', {name: /numeric/}));
            const inputNumber = screen.getByRole('spinbutton');
            expect(inputNumber).toBeVisible();
            expect(inputNumber).toHaveValue(filter.value);
        });

        test('should not render numeric input if condition is IS_EMPTY', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'numeric filter',
                    format: gqlTypes.AttributeFormat.numeric,
                    type: AttributeType.simple
                },
                field: 'test',
                value: '1',
                condition: AttributeConditionFilter.EQUAL
            };

            render(
                <MockViewSettingsContextProvider viewMock={{...viewSettingsInitialState, filters: [filter]}}>
                    <CommonFilterItemContainer />
                </MockViewSettingsContextProvider>
            );
            await user.click(screen.getByRole('button', {name: /numeric/}));
            expect(screen.queryByRole('spinbutton')).toBeInTheDocument();

            const select = screen.getByRole('combobox');
            await user.click(select);

            const option = screen.getByText(/is-empty/);
            await user.click(option);

            expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
        });
    });

    describe('text filter', () => {
        test('should render text filter', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'text filter',
                    format: gqlTypes.AttributeFormat.text,
                    type: AttributeType.simple
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.EQUAL
            };

            const {baseElement} = render(<CommonFilterItem filter={filter} />);
            await user.click(screen.getByRole('button', {name: /text/}));
            const textInput = screen.getByRole('textbox');
            expect(textInput).toBeVisible();
            expect(textInput).toHaveValue(filter.value);

            const select = screen.getByRole('combobox');
            await user.click(select);
            const options = getAllConditionOptions(baseElement);
            expect(options).toHaveLength(conditionsByFormat[gqlTypes.AttributeFormat.text].length);
        });

        test('should not render text input if condition is IS_EMPTY', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'text filter',
                    format: gqlTypes.AttributeFormat.text,
                    type: AttributeType.simple
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.EQUAL
            };

            render(
                <MockViewSettingsContextProvider viewMock={{...viewSettingsInitialState, filters: [filter]}}>
                    <CommonFilterItemContainer />
                </MockViewSettingsContextProvider>
            );
            await user.click(screen.getByRole('button', {name: /text/}));
            expect(screen.queryByRole('textbox')).toBeInTheDocument();

            const select = screen.getByRole('combobox');
            await user.click(select);

            const option = screen.getByText(/is-empty/);
            await user.click(option);
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        });
    });

    describe('rich text filter', () => {
        test('should render rich text filter', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'rich text filter',
                    format: gqlTypes.AttributeFormat.rich_text,
                    type: AttributeType.simple
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.EQUAL
            };

            const {baseElement} = render(<CommonFilterItem filter={filter} />);
            await user.click(screen.getByRole('button', {name: /rich text/}));
            const textInput = screen.getByRole('textbox');
            expect(textInput).toBeVisible();
            expect(textInput).toHaveValue(filter.value);

            const select = screen.getByRole('combobox');
            await user.click(select);
            const options = getAllConditionOptions(baseElement);
            expect(options).toHaveLength(conditionsByFormat[gqlTypes.AttributeFormat.rich_text].length);
        });

        test('should not render rich text input if condition is IS_EMPTY', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'rich text filter',
                    format: gqlTypes.AttributeFormat.rich_text,
                    type: AttributeType.simple
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.EQUAL
            };

            render(
                <MockViewSettingsContextProvider viewMock={{...viewSettingsInitialState, filters: [filter]}}>
                    <CommonFilterItemContainer />
                </MockViewSettingsContextProvider>
            );
            await user.click(screen.getByRole('button', {name: /rich text/}));
            expect(screen.queryByRole('textbox')).toBeInTheDocument();

            const select = screen.getByRole('combobox');
            await user.click(select);

            const option = screen.getByText(/is-empty/);
            await user.click(option);
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        });
    });

    describe('boolean filter', () => {
        test('should render boolean filter', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'boolean filter',
                    format: gqlTypes.AttributeFormat.boolean,
                    type: AttributeType.simple
                },
                field: 'test',
                value: 'true',
                condition: AttributeConditionFilter.EQUAL
            };

            render(<CommonFilterItem filter={filter} />);
            await user.click(screen.getByRole('button', {name: /boolean/}));
            expect(screen.getByText(/true/)).toBeVisible();
        });
    });

    describe('date filter', () => {
        const date = {unix: '1730761200', formatted: dayjs.unix(1730761200).format('YYYY-MM-DD')};

        test('should render simple filter', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'date filter',
                    format: gqlTypes.AttributeFormat.date,
                    type: AttributeType.simple
                },
                field: 'test',
                value: date.unix,
                condition: AttributeConditionFilter.EQUAL
            };

            render(<CommonFilterItem filter={filter} />);
            await user.click(screen.getByRole('button', {name: /date/}));
            const textInput = screen.getByRole('textbox');
            expect(textInput).toBeVisible();
            expect(textInput).toHaveValue(date.formatted);
        });

        test('should render an DateRangePicker if condition is BETWEEN', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'date filter',
                    format: gqlTypes.AttributeFormat.date,
                    type: AttributeType.simple
                },
                field: 'test',
                value: date.unix,
                condition: AttributeConditionFilter.EQUAL
            };

            render(
                <MockViewSettingsContextProvider viewMock={{...viewSettingsInitialState, filters: [filter]}}>
                    <CommonFilterItemContainer />
                </MockViewSettingsContextProvider>
            );
            await user.click(screen.getByRole('button', {name: /date/}));
            expect(screen.queryByRole('textbox')).toBeInTheDocument();

            const select = screen.getByRole('combobox');
            await user.click(select);

            const emptyOption = screen.getAllByText(/between/).pop()!;
            await user.click(emptyOption);

            expect(screen.queryAllByRole('textbox').length).toBe(2);
        });
    });

    describe('color filter', () => {
        test('should render color filter', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'color filter',
                    format: gqlTypes.AttributeFormat.color,
                    type: AttributeType.simple
                },
                field: 'test',
                value: null,
                condition: null
            };

            render(<CommonFilterItem filter={filter} />);
            await user.click(screen.getByRole('button', {name: /color/}));
            expect(await screen.findByText(/select-condition/)).toBeVisible();
        });
    });

    describe('encrypted filter', () => {
        test('should render encrypted filter', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'encrypted filter',
                    format: gqlTypes.AttributeFormat.encrypted,
                    type: AttributeType.simple
                },
                field: 'test',
                value: null,
                condition: null
            };

            render(<CommonFilterItem filter={filter} />);
            await user.click(screen.getByRole('button', {name: /encrypted/}));
            expect(await screen.findByText(/select-condition/)).toBeVisible();
        });
    });

    describe('extended filter', () => {
        test('should render extended filter', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'extended filter',
                    format: gqlTypes.AttributeFormat.extended,
                    type: AttributeType.simple
                },
                field: 'test',
                value: null,
                condition: null
            };

            render(<CommonFilterItem filter={filter} />);
            await user.click(screen.getByRole('button', {name: /extended/}));
            expect(await screen.findByText(/select-condition/)).toBeVisible();
        });
    });

    describe('period filter', () => {
        test('should render period filter', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'period filter',
                    format: gqlTypes.AttributeFormat.date_range,
                    type: AttributeType.simple
                },
                field: 'test',
                value: null,
                condition: null
            };

            render(<CommonFilterItem filter={filter} />);
            await user.click(screen.getByRole('button', {name: /period/}));
            expect(await screen.findByText(/select-condition/)).toBeVisible();
        });
    });

    describe('link filter', () => {
        test('should behave like a text filter', async () => {
            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'link filter',
                    type: AttributeType.advanced_link
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.EQUAL
            };

            const {baseElement} = render(<CommonFilterItem filter={filter} />);
            await user.click(screen.getByRole('button', {name: /link/}));
            const textInput = screen.getByRole('textbox');
            expect(textInput).toBeVisible();
            expect(textInput).toHaveValue(filter.value);

            const select = screen.getByRole('combobox');
            await user.click(select);
            const options = getAllConditionOptions(baseElement);
            expect(options).toHaveLength(conditionsByFormat[gqlTypes.AttributeFormat.text].length + 1); // + 1 for "through" condition
        });

        test('should handle "through" condition', async () => {
            // GIVEN a link filter with a through condition
            const mockLinkedAttribute = {
                id: 'linked_attribute',
                label: {fr: 'Linked Attribute'},
                type: AttributeType.simple,
                format: gqlTypes.AttributeFormat.text
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
                                    attributes: [mockLinkedAttribute]
                                }
                            ]
                        }
                    }
                }
            ];

            jest.spyOn(gqlTypes, 'useGetLibraryAttributesLazyQuery').mockReturnValue(
                mockUseGetLibraryAttributesLazyQuery as gqlTypes.GetLibraryAttributesLazyQueryHookResult
            );

            const filter: ExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'link filter',
                    type: AttributeType.advanced_link,
                    linkedLibrary: {
                        id: 'link_library'
                    }
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.THROUGH,
                subCondition: null,
                subField: null
            };

            // WHEN the filter dropdown is displayed
            const {baseElement} = render(
                <MockViewSettingsContextProvider viewMock={{...viewSettingsInitialState, filters: [filter]}}>
                    <CommonFilterItem filter={filter} />
                </MockViewSettingsContextProvider>
            );
            await user.click(screen.getByRole('button', {name: /link/}));

            // THEN the "through" condition should be selected
            const conditionSelect = screen.getByRole('combobox', {name: /filter-link-condition/});
            await user.click(conditionSelect);
            const throughOption = screen.getByRole('option', {name: /through/i});
            expect(throughOption).toHaveAttribute('aria-selected', 'true');
            await user.click(throughOption);

            // AND the subField select is available
            const subFieldSelect = screen.getByRole('combobox', {name: /link-attribute/});
            expect(subFieldSelect).toBeInTheDocument();

            // WHEN the user select a link attribute
            await user.click(subFieldSelect);
            const linkAttributeOption = screen.getByText(mockLinkedAttribute.label.fr);
            expect(linkAttributeOption).toBeVisible();
            await user.click(linkAttributeOption);

            // THEN the sub condition dropdown should be displayed
            const subConditionSelect = screen.getByRole('combobox', {name: /filter-condition/});
            expect(subConditionSelect).toBeInTheDocument();

            // WHEN the user select a sub condition
            await user.click(subConditionSelect);
            const subConditionSelectVirtualList = baseElement
                .getElementsByClassName('rc-virtual-list')
                .item(2) as HTMLElement;
            expect(subConditionSelectVirtualList).toBeVisible();
            await user.click(within(subConditionSelectVirtualList).getByText('filters.not-contains'));

            // THEN the value textbox is displayed
            expect(await screen.findByRole('textbox')).toBeVisible();
        });
    });
});
