// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import userEvent from '@testing-library/user-event';
import {IExplorerFilter} from '../../_types';
import {CommonFilterItem} from './CommonFilterItem';
import {AttributeFormat} from '_ui/_gqlTypes';
import {AttributeConditionFilter} from '_ui/types';

const getAllConditionOptions = (base: ReturnType<typeof render>['baseElement']) =>
    base.getElementsByClassName('rc-virtual-list')[0].getElementsByClassName('kit-select-option');

describe('CommonFilterItem', () => {
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
});
