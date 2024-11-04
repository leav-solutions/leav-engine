// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '_ui/_tests/testUtils';
import MenuSelection from './MenuSelection';

describe('MenuSelection', () => {
    test('should display a dropdown', async () => {
        await act(async () => {
            render(<MenuSelection />);
        });

        expect(screen.getByTestId('dropdown-menu-selection')).toBeInTheDocument();
        expect(screen.queryByText(/items-list-row.nb-elements/i)).toBeInTheDocument();
    });
});
