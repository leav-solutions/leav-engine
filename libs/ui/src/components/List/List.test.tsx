// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {render, screen, waitFor, within} from '_ui/_tests/testUtils';
import List from './List';

describe('List', () => {
    test('Render items', async () => {
        render(<List dataSource={['Item A', 'Item B']} />);

        const rows = screen.getAllByRole('listitem');
        expect(rows).toHaveLength(2);
        expect(rows[0].textContent).toBe('Item A');
    });

    test('Can override items rendering', async () => {
        render(<List dataSource={['Item A', 'Item B']} renderItemContent={item => <div>{item + 'Override'}</div>} />);

        expect(screen.getByText('Item AOverride')).toBeInTheDocument();
    });

    test('Can select elements', async () => {
        const onSelect = jest.fn();

        render(<List dataSource={['Item A', 'Item B']} selectable selectedItems={[]} onSelectionChange={onSelect} />);

        const firstRow = screen.getAllByRole('listitem')[0];
        userEvent.hover(firstRow);

        const checkbox = within(firstRow).getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();

        userEvent.click(checkbox);

        await waitFor(() => {
            expect(onSelect).toBeCalledWith(['Item A']);
        });
    });

    test('Automatically check selected elements', async () => {
        const onSelect = jest.fn();

        render(
            <List
                dataSource={['Item A', 'Item B']}
                selectable
                selectedItems={['Item B']}
                onSelectionChange={onSelect}
            />
        );

        const secondRow = screen.getAllByRole('listitem')[1];

        const checkbox = within(secondRow).getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toBeChecked();

        userEvent.click(checkbox);

        await waitFor(() => {
            expect(onSelect).toBeCalledWith([]);
        });
    });
});
