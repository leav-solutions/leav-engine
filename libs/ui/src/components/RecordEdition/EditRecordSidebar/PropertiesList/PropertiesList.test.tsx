// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
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

    it('should render items', () => {
        render(<PropertiesList items={items} />);

        items.forEach(item => {
            expect(screen.getByText(item.title)).toBeInTheDocument();
            expect(screen.getByText(item.value)).toBeInTheDocument();
        });
    });
});
