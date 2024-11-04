// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '_ui/_tests/testUtils';
import PropertiesList from './PropertiesList';

describe('PropertiesList', () => {
    const items = [
        {
            title: 'fieldA',
            value: 'valueA'
        },
        {
            title: 'fieldB',
            value: 'valueB'
        }
    ];
    test('Render items', async () => {
        await act(async () => {
            render(<PropertiesList items={items} />);
        });

        for (const item of items) {
            expect(screen.getByText(item.title)).toBeInTheDocument();
            expect(screen.getByText(item.value)).toBeInTheDocument();
        }
    });

    test('Render a divider', async () => {
        await act(async () => {
            render(<PropertiesList items={[...items, {divider: true}]} />);
        });

        expect(screen.getByRole('separator')).toBeInTheDocument();
    });
});
