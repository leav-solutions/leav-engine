// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act, render, screen, within} from '_tests/testUtils';
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
        await act(async () => {
            userEvent.hover(firstRow, null);
        });

        const checkbox = within(firstRow).getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();

        await act(async () => {
            userEvent.click(checkbox);
        });

        expect(onSelect).toBeCalledWith(['Item A']);
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

        await act(async () => {
            userEvent.click(checkbox);
        });

        expect(onSelect).toBeCalledWith([]);
    });
});
