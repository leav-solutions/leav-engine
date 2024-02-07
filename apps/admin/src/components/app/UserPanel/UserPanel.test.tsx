// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import * as useLang from 'hooks/useLang';
import {BrowserRouter} from 'react-router-dom-v5';
import {AvailableLanguage} from '_gqlTypes/globalTypes';
import {act, render, screen} from '_tests/testUtils';
import UserPanel from './UserPanel';

const mockLogout = jest.fn();
jest.mock('hooks/useAuth', () => () => ({
    logout: mockLogout
}));

describe('UserPanel', () => {
    beforeEach(() => jest.clearAllMocks());

    test('Should display some menu items', async () => {
        await act(async () => {
            render(
                <BrowserRouter>
                    <UserPanel visible onHide={jest.fn()} />
                </BrowserRouter>
            );
        });

        expect(screen.getAllByRole('menuitem').length).toBeGreaterThanOrEqual(1);
    });

    test('On click on logout, log out and redirect to home', async () => {
        const mockedLocation = {...window.location, replace: jest.fn()};
        delete window.location;
        window.location = mockedLocation;

        await act(async () => {
            render(
                <BrowserRouter>
                    <UserPanel visible onHide={jest.fn()} />
                </BrowserRouter>
            );
        });

        const logoutLink = screen.getByRole('menuitem', {name: /logout/});

        await act(async () => {
            userEvent.click(logoutLink);
        });

        expect(mockLogout).toHaveBeenCalled();
    });

    test('Can switch language', async () => {
        const mockUpdateLang = jest.fn();
        jest.spyOn(useLang, 'default').mockImplementation(() => ({
            lang: [AvailableLanguage.en],
            availableLangs: [AvailableLanguage.fr, AvailableLanguage.en],
            defaultLang: AvailableLanguage.en,
            setLang: mockUpdateLang
        }));

        await act(async () => {
            render(
                <BrowserRouter>
                    <UserPanel visible onHide={jest.fn()} />
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
