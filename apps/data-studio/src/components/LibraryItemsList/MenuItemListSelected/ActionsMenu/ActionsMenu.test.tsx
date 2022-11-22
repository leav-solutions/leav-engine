// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import ActionsMenu from './ActionsMenu';

jest.mock('./ExportModal', () => {
    return function ExportModal() {
        return <div>ExportModal</div>;
    };
});

describe('ActionsMenu', () => {
    test('Render menu', async () => {
        render(<ActionsMenu />);

        expect(screen.getByRole('button')).toBeInTheDocument();

        await act(async () => {
            userEvent.click(screen.getByRole('button'));
        });

        expect(await screen.findByText(/export/)).toBeInTheDocument();
    });
});
