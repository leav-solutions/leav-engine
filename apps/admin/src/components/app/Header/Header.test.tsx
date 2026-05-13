import React from 'react';
import {render, screen} from '../../../_tests/testUtils';
import Header from './Header';

jest.mock(
    '../../applications/ApplicationsSwitcher',
    () =>
        function ApplicationsSwitcher() {
            return <div>ApplicationsSwitcher</div>;
        },
);

describe('Header', () => {
    test('Render menu', async () => {
        render(<Header />);

        expect(screen.getByRole('link', {name: /title/})).toBeInTheDocument();
    });
});
