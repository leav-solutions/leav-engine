// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import Header from './Header';

jest.mock('components/applications/ApplicationsSwitcher', () => {
    return function ApplicationsSwitcher() {
        return <div>ApplicationsSwitcher</div>;
    };
});

describe('Header', () => {
    test('Render menu', async () => {
        render(<Header />);

        expect(screen.getByRole('link', {name: /title/})).toBeInTheDocument();
    });
});
