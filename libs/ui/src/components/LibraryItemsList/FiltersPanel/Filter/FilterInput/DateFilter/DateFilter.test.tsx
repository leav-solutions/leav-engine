// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {mockFilterAttribute} from '_ui/__mocks__/common/filter';
import DateFilter from './DateFilter';

describe('DateFilter', () => {
    test('Should have a Date picker', async () => {
        render(<DateFilter filter={{...mockFilterAttribute, value: {value: '0'}}} updateFilterValue={jest.fn()} />);

        expect(screen.getByRole('textbox', {name: /date/})).toBeInTheDocument();
    });
});
