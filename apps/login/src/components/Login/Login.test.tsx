// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from 'react-router-dom';
import Login from './Login';
import {enableFetchMocks} from 'jest-fetch-mock';

enableFetchMocks();

window.matchMedia = query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
});

jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom') as {}),
    useParams: jest
        .fn()
        .mockReturnValueOnce({dest: '/'})
        .mockReturnValueOnce({dest: '/'})
        .mockReturnValueOnce({dest: '/my-app'})
        .mockReturnValue({})
}));

const _renderComponent = (url: string = '/') =>
    render(
        <MemoryRouter initialEntries={[url]}>
            <Login />
        </MemoryRouter>
    );

const _enterCredentialsAndSubmit = () => {
    userEvent.type(screen.getByRole('textbox', {name: /login/}), 'admin');
    userEvent.type(screen.getByLabelText(/password/), 'mypwd');
    userEvent.click(screen.getByRole('button', {name: /submit/}));
};

describe('Login', () => {
    const {location} = window;

    beforeAll(() => {
        delete window.location;
        window.location = {...location, replace: jest.fn(), search: ''};
        Object.defineProperty(window.location, 'replace', jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        window.location = location;
    });

    test('Type credentials in login form and redirects to root', async () => {
        (fetch as jest.FunctionLike) = jest.fn().mockReturnValue({
            status: 200,
            ok: true
        });

        await act(async () => {
            _renderComponent();
        });

        await act(async () => {
            _enterCredentialsAndSubmit();
        });

        expect(window.location.replace).toBeCalledWith('/');
    });

    test('Type credentials in login form and redirects to given path', async () => {
        (fetch as jest.FunctionLike) = jest.fn().mockReturnValue({
            status: 200,
            ok: true
        });

        await act(async () => {
            _renderComponent('/?dest=/my-app');
        });

        await act(async () => {
            _enterCredentialsAndSubmit();
        });

        expect(window.location.replace).toBeCalledWith('/my-app');
    });

    test('Display message if bad credentials', async () => {
        (fetch as jest.FunctionLike) = jest.fn().mockReturnValue({
            status: 401,
            ok: false
        });

        await act(async () => {
            _renderComponent();
        });

        await act(async () => {
            _enterCredentialsAndSubmit();
        });

        expect(screen.getByText(/bad_credentials/)).toBeInTheDocument();
        expect(window.location.replace).not.toBeCalled();
    });

    test('Display message if server is down', async () => {
        (fetch as jest.FunctionLike) = jest.fn().mockReturnValue({
            status: 500,
            ok: false
        });

        await act(async () => {
            _renderComponent();
        });

        await act(async () => {
            _enterCredentialsAndSubmit();
        });

        expect(screen.getByText(/no_server_response/)).toBeInTheDocument();
        expect(window.location.replace).not.toBeCalled();
    });
});
