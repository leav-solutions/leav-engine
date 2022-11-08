// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {act} from 'react-dom/test-utils';
import {FieldScope} from '../../_types';
import AddValueBtn from './AddValueBtn';

describe('AddValueBtn', () => {
    test('Display add value button', async () => {
        const mockOnClick = jest.fn();

        await act(async () => {
            render(<AddValueBtn activeScope={FieldScope.CURRENT} onClick={mockOnClick} />);
        });

        const btn = screen.getByRole('button', {name: /add_value/});
        expect(btn).toBeInTheDocument();
        expect(screen.getByText(/add_value/)).toBeInTheDocument();

        await act(async () => {
            userEvent.click(btn);
        });

        expect(mockOnClick).toBeCalled();
    });
});
