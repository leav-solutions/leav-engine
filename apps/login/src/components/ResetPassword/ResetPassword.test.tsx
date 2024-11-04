// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {KitApp} from 'aristid-ds';
import {enableFetchMocks} from 'jest-fetch-mock';
import {MemoryRouter} from 'react-router-dom';
import ResetPassword from './ResetPassword';

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
    useParams: () => ({token: '123456'})
}));

const _renderComponent = (url = '/') =>
    render(
        <KitApp>
            <MemoryRouter initialEntries={[url]}>
                <ResetPassword />
            </MemoryRouter>
        </KitApp>
    );

const _enterPasswordsAndSubmit = () => {
    userEvent.type(screen.getByLabelText(/new_password/), 'password');
    userEvent.type(screen.getByLabelText(/confirm_password/), 'password');
    userEvent.click(screen.getByRole('button', {name: /submit/}));
};

describe('ResetPassword', () => {
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

    test('Type passwords in form and redirects to root', async () => {
        (fetch as jest.FunctionLike) = jest.fn().mockReturnValue({
            status: 200,
            ok: true
        });

        await act(async () => {
            _renderComponent();
        });

        await act(async () => {
            _enterPasswordsAndSubmit();
        });

        expect(window.location.replace).toBeCalledWith('/');
    });

    test('Display message if token is invalid', async () => {
        (fetch as jest.FunctionLike) = jest.fn().mockReturnValue({
            status: 401,
            ok: false
        });

        await act(async () => {
            _renderComponent();
        });

        await act(async () => {
            _enterPasswordsAndSubmit();
        });

        expect(screen.getByText(/invalid_token/)).toBeInTheDocument();
        expect(window.location.replace).not.toBeCalled();
    });

    test('Display message if password is not valid', async () => {
        (fetch as jest.FunctionLike) = jest.fn().mockReturnValue({
            status: 422,
            ok: false
        });

        await act(async () => {
            _renderComponent();
        });

        await act(async () => {
            _enterPasswordsAndSubmit();
        });

        expect(screen.getByText(/invalid_password/)).toBeInTheDocument();
        expect(window.location.replace).not.toBeCalled();
    });
});
