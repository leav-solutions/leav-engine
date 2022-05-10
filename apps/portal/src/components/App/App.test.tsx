// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getMe} from 'queries/me/me';
import React from 'react';
import {mockUser} from '_tests/mocks/user';
import {render, screen} from '_tests/testUtils';
import App from './App';

jest.mock('components/UserMenu', () => {
    return function UserMenu() {
        return <div>UserMenu</div>;
    };
});
jest.mock('components/Applications', () => {
    return function Applications() {
        return <div>Applications</div>;
    };
});

describe('App', () => {
    test('Render test', async () => {
        const mocks = [
            {
                request: {
                    query: getMe,
                    variables: {}
                },
                result: {
                    data: {
                        me: mockUser
                    }
                }
            }
        ];
        render(<App />, {apolloMocks: mocks});

        expect(await screen.findByText('UserMenu')).toBeInTheDocument();
        expect(screen.getByText('Applications')).toBeInTheDocument();
    });
});
