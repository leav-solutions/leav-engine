// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import {mockFilterAttribute} from '__mocks__/common/filter';
import NumericFilter from './NumericFilter';

describe('NumericFilter', () => {
    test('Should have a number input', async () => {
        render(<NumericFilter filter={mockFilterAttribute} updateFilterValue={jest.fn()} />);

        expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
});
