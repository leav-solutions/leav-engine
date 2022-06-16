// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {mockFormElementTextBlock} from '__mocks__/common/form';
import TextBlock from './TextBlock';

describe('TextBlock', () => {
    test('Render text block with markdown converted', async () => {
        render(<TextBlock element={mockFormElementTextBlock} onValueDelete={jest.fn()} onValueSubmit={jest.fn()} />);

        expect(screen.getByText(/text content/i)).toBeInTheDocument();
        expect(screen.getByText('text content')).toHaveStyle('font-weight: bold');
    });
});
