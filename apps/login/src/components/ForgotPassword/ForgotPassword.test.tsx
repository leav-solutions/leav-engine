// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

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
    ...(jest.requireActual('react-router-dom') as {})
}));

const _renderComponent = () =>
    render(
        <MemoryRouter>
            <ForgotPassword />
        </MemoryRouter>
    );

const _enterValidEmailAndSubmit = () => {
    userEvent.type(screen.getByRole('textbox', {name: /email/}), 'email@domain.com');
    userEvent.click(screen.getByRole('button', {name: /submit/}));
};

describe('ForgotPassword', () => {
    test('Display error msg if user is not found', async () => {
        (fetch as jest.FunctionLike) = jest.fn().mockReturnValue({
            status: 401,
            ok: false
        });

        await act(async () => {
            _renderComponent();
        });

        await act(async () => {
            _enterValidEmailAndSubmit();
        });

        expect(screen.getByText(/user_not_found/)).toBeInTheDocument();
    });

    test('Display success message if email has been sent', async () => {
        (fetch as jest.FunctionLike) = jest.fn().mockReturnValue({
            status: 200,
            ok: true
        });

        await act(async () => {
            _renderComponent();
        });

        await act(async () => {
            _enterValidEmailAndSubmit();
        });

        expect(screen.getByText(/success/)).toBeInTheDocument();
    });

    test('Display error msg if server is down', async () => {
        (fetch as jest.FunctionLike) = jest.fn().mockReturnValue({
            status: 500,
            ok: false
        });

        await act(async () => {
            _renderComponent();
        });

        await act(async () => {
            _enterValidEmailAndSubmit();
        });

        expect(screen.getByText(/no_server_response/)).toBeInTheDocument();
    });
});
