// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {mockApiKey} from '__mocks__/common/apiKeys';
import EditApiKeyModal from './EditApiKeyModal';

jest.mock('components/shared/RecordSelector', () => {
    return function RecordSelector() {
        return <div>RecordSelector</div>;
    };
});

describe('EditApiKeyModal', () => {
    test('Render form', async () => {
        await act(async () => {
            render(<EditApiKeyModal apiKey={{...mockApiKey, expiresAt: null}} onClose={jest.fn()} />);
        });

        expect(screen.getByText(mockApiKey.label)).toBeInTheDocument();
        expect(screen.getByText('RecordSelector')).toBeInTheDocument();
        expect(screen.getByText(/never/)).toBeInTheDocument();

        // Edit expiration date
        userEvent.click(screen.getByText(/edit_expiration/));
        const dropdown = screen.getByRole('listbox');
        expect(dropdown).toBeInTheDocument();

        userEvent.click(dropdown);
        userEvent.click(screen.getByRole('option', {name: /custom/}));

        expect(screen.getByTestId('custom-date-input')).toBeInTheDocument();
    });
});
