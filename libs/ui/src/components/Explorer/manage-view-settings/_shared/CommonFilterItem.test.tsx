// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import {IExplorerFilter} from '../../_types';
import {CommonFilterItem} from './CommonFilterItem';
import {AttributeFormat} from '_ui/_gqlTypes';
import {AttributeConditionFilter} from '_ui/types';
import {FunctionComponent, useReducer} from 'react';
import {IViewSettingsState, viewSettingsReducer} from '../store-view-settings/viewSettingsReducer';
import {ViewSettingsContext} from '../store-view-settings/ViewSettingsContext';
import {viewSettingsInitialState} from '../store-view-settings/viewSettingsInitialState';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';

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
    describe('numeric filter', () => {
        test('should render numeric filter', async () => {
            const filter: IExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'numeric filter',
                    format: AttributeFormat.numeric
                },
                field: 'test',
                value: '1',
                condition: AttributeConditionFilter.EQUAL
            };

            render(<CommonFilterItem filter={filter} />);
            await userEvent.click(screen.getByRole('button', {name: /numeric/}));
            const inputNumber = screen.getByRole('spinbutton');
            expect(inputNumber).toBeVisible();
            expect(inputNumber).toHaveValue(filter.value);
        });

        test('should not render numeric input if condition is IS_EMPTY', async () => {
            const filter: IExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'numeric filter',
                    format: AttributeFormat.numeric
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
            await userEvent.click(screen.getByRole('button', {name: /numeric/}));
            expect(screen.queryByRole('spinbutton')).toBeInTheDocument();

            const select = screen.getByRole('combobox');
            await userEvent.click(select);

            const options = screen.getAllByText(/is-empty/);
            await userEvent.click(options.pop()!);

            expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
        });
    });

    describe('text filter', () => {
        test('should render text filter', async () => {
            const filter: IExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'text filter',
                    format: AttributeFormat.text
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.EQUAL
            };

            const {baseElement} = render(<CommonFilterItem filter={filter} />);
            await userEvent.click(screen.getByRole('button', {name: /text/}));
            const textInput = screen.getByRole('textbox');
            expect(textInput).toBeVisible();
            expect(textInput).toHaveValue(filter.value);

            const select = screen.getByRole('combobox');
            await userEvent.click(select);
            const options = getAllConditionOptions(baseElement);
            expect(options).toHaveLength(8);
        });

        test('should not render text input if condition is IS_EMPTY', async () => {
            const filter: IExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'text filter',
                    format: AttributeFormat.text
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
            await userEvent.click(screen.getByRole('button', {name: /text/}));
            expect(screen.queryByRole('textbox')).toBeInTheDocument();

            const select = screen.getByRole('combobox');
            await userEvent.click(select);

            const options = screen.getAllByText(/is-empty/);
            await userEvent.click(options.pop()!);
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        });
    });

    describe('rich text filter', () => {
        test('should render rich text filter', async () => {
            const filter: IExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'rich text filter',
                    format: AttributeFormat.rich_text
                },
                field: 'test',
                value: 'test value',
                condition: AttributeConditionFilter.EQUAL
            };

            const {baseElement} = render(<CommonFilterItem filter={filter} />);
            await userEvent.click(screen.getByRole('button', {name: /rich text/}));
            const textInput = screen.getByRole('textbox');
            expect(textInput).toBeVisible();
            expect(textInput).toHaveValue(filter.value);

            const select = screen.getByRole('combobox');
            await userEvent.click(select);
            const options = getAllConditionOptions(baseElement);
            expect(options).toHaveLength(4);
        });

        test('should not render rich text input if condition is IS_EMPTY', async () => {
            const filter: IExplorerFilter = {
                id: 'test',
                attribute: {
                    label: 'rich text filter',
                    format: AttributeFormat.rich_text
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
            await userEvent.click(screen.getByRole('button', {name: /rich text/}));
            expect(screen.queryByRole('textbox')).toBeInTheDocument();

            const select = screen.getByRole('combobox');
            await userEvent.click(select);

            const options = screen.getAllByText(/is-empty/);
            await userEvent.click(options.pop()!);
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        });
    });
});