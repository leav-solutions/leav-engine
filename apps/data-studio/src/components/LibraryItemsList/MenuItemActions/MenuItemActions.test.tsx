// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {render, screen} from '_tests/testUtils';
import MenuItemActions from './MenuItemActions';

jest.mock(
    '../LibraryItemsListTable/ChooseTableColumns',
    () =>
        function ChooseTableColumns() {
            return <div>ChooseTableColumns</div>;
        }
);

describe('MenuItemActions', () => {
    test('should get a button', async () => {
        render(<MenuItemActions />);

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('should get sort-advance', async () => {
        render(<MenuItemActions />);

        await act(async () => {
            userEvent.click(screen.getByRole('button'));
        });

        expect(screen.getByText(/sort-advance/)).toBeInTheDocument();
    });

    test('should get regroup', async () => {
        render(<MenuItemActions />);

        await act(async () => {
            userEvent.click(screen.getByRole('button'));
        });

        expect(screen.getByText(/regroup/)).toBeInTheDocument();
    });
});
