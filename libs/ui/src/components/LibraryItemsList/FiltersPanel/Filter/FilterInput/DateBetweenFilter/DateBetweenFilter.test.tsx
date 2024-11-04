// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {mockFilterAttribute} from '_ui/__mocks__/common/filter';
import DateBetweenFilter from './DateBetweenFilter';

describe('DateFilter', () => {
    test('Should have a Date picker', async () => {
        render(<DateBetweenFilter filter={mockFilterAttribute} updateFilterValue={jest.fn()} />);

        expect(screen.getAllByRole('textbox')).toHaveLength(2);
    });
});
