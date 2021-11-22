// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import * as useLang from 'hooks/LangHook/LangHook';
import * as useAuthToken from 'hooks/useAuthToken/useAuthToken';
import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {act, render, screen} from '_tests/testUtils';
import UserPanel from './UserPanel';

describe('UserPanel', () => {
    test('Should display some menu items', async () => {
        await act(async () => {
            render(
                <BrowserRouter>
                    <UserPanel userPanelVisible hideUserPanel={jest.fn()} />
                </BrowserRouter>
            );
        });

        expect(screen.getAllByRole('menuitem').length).toBeGreaterThanOrEqual(1);
    });

    test('On click on logout, log out and redirect to home', async () => {
        const mockDeleteToken = jest.fn();

        jest.spyOn(useAuthToken, 'default').mockImplementation(() => ({
            getToken: jest.fn(),
            saveToken: jest.fn(),
            deleteToken: mockDeleteToken
        }));
        window.location.replace = jest.fn();

        await act(async () => {
            render(
                <BrowserRouter>
                    <UserPanel userPanelVisible hideUserPanel={jest.fn()} />
                </BrowserRouter>
            );
        });

        const logoutLink = screen.getByRole('menuitem', {name: /logout/});

        await act(async () => {
            userEvent.click(logoutLink);
        });

        expect(mockDeleteToken).toHaveBeenCalled();
        expect(window.location.replace).toHaveBeenCalledWith('/');
    });

    test('Can switch language', async () => {
        const mockUpdateLang = jest.fn();
        jest.spyOn(useLang, 'useLang').mockImplementation(() => [
            {
                lang: ['en'],
                availableLangs: ['fr', 'en'],
                defaultLang: 'en'
            },
            mockUpdateLang
        ]);

        await act(async () => {
            render(
                <BrowserRouter>
                    <UserPanel userPanelVisible hideUserPanel={jest.fn()} />
                </BrowserRouter>
            );
        });

        expect(screen.getByRole('button', {name: /🇫🇷/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /🇬🇧/})).toBeInTheDocument();

        await act(async () => {
            userEvent.click(screen.getByRole('button', {name: /🇫🇷/}));
        });

        expect(mockUpdateLang).toHaveBeenCalled();
    });
});
