// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import '@testing-library/jest-dom';
import React from 'react';
import {render, screen, waitFor} from '_tests/testUtils';
import AuthHandler from './AuthHandler';

jest.mock('../Login', () => {
    return function Login() {
        return <div>Login</div>;
    };
});

jest.mock('../../app/App', () => {
    return function App() {
        return <div>App</div>;
    };
});

jest.mock('components/app/ApolloHandler', () => {
    return function ApolloHandler({children}) {
        return <div>{children}</div>;
    };
});

jest.mock('../../../redux/store', () => ({
    store: {}
}));

const mockGetToken = jest.fn();
jest.mock('@leav/utils', () => ({
    useAuthToken: jest.fn(() => ({
        getToken: mockGetToken,
        saveToken: jest.fn(),
        deleteToken: jest.fn()
    }))
}));
describe('AuthHandler', () => {
    test('If no token found, render login', async () => {
        mockGetToken.mockImplementation(() => null);
        render(<AuthHandler url={''} />);

        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    test('If token is found, render app', async () => {
        mockGetToken.mockImplementation(() => 'my_token');
        render(<AuthHandler url={''} />);

        expect(await waitFor(() => screen.getByText('App'))).toBeInTheDocument();
    });
});
