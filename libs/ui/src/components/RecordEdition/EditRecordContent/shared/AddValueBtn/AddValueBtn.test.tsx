// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {act, render, screen, waitFor} from '_ui/_tests/testUtils';
import {VersionFieldScope} from '../../_types';
import AddValueBtn from './AddValueBtn';

describe('AddValueBtn', () => {
    test('Display add value button', async () => {
        const mockOnClick = jest.fn();

        await act(async () => {
            render(<AddValueBtn activeScope={VersionFieldScope.CURRENT} onClick={mockOnClick} />);
        });

        const btn = screen.getByRole('button', {name: /add_value/});
        expect(btn).toBeInTheDocument();
        expect(screen.getByText(/add_value/)).toBeInTheDocument();

        userEvent.click(btn);

        await waitFor(() => {
            expect(mockOnClick).toBeCalled();
        });
    });
});
