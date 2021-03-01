// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {mockFilter} from '__mocks__/common/filter';
import TextFilter from '../../DisplayTypeSelector/FilterInput/TextFilter';

describe('FormText', () => {
    test('Should have a TextArea', async () => {
        render(<TextFilter filter={mockFilter} updateFilterValue={jest.fn()} />);

        const element = await screen.findByTestId('filter-textarea');

        expect(element).toBeInTheDocument();
    });
});
