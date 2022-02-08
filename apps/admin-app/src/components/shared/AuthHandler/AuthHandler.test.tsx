// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import React from 'react';
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

jest.mock('../../../redux/store', () => ({
    store: {}
}));

const storageGen = () => {
    let store = {};

    return {
        key: nbr => {
            return nbr.toString;
        },
        length: 1,
        setItem: (key, value) => {
            store[key] = value;
        },
        removeItem: key => {
            if (store[key]) {
                store[key] = undefined;
            }
        },
        getItem: key => {
            return store[key];
        },
        clear: () => {
            store = {};
        }
    };
};

describe('AuthHandler', () => {
    test('If no token found, render login', async () => {
        const storage = storageGen();
        render(<AuthHandler url={''} storage={storage} />);

        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    test('If token is found, render app', async () => {
        const storage = storageGen();
        storage.setItem('accessToken', 'mytoken');
        render(<AuthHandler url={''} storage={storage} />);

        expect(screen.getByText('App')).toBeInTheDocument();
    });
});
