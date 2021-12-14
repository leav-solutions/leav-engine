// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {mockFilterAttribute} from '__mocks__/common/filter';
import TextFilter from './TextFilter';

describe('FormText', () => {
    test('Should have a TextArea', async () => {
        render(<TextFilter filter={mockFilterAttribute} updateFilterValue={jest.fn()} />);

        const textElement = await screen.findByTestId('filter-textarea');

        expect(textElement).toBeInTheDocument();
    });
});
