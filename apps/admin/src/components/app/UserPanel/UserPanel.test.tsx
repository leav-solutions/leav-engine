// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import * as useLang from 'hooks/useLang';
import {BrowserRouter} from 'react-router-dom-v5';
import {AvailableLanguage} from '_gqlTypes';
import {render, screen} from '_tests/testUtils';
import UserPanel from './UserPanel';

const mockLogout = jest.fn();
jest.mock('hooks/useAuth', () => () => ({
    logout: mockLogout,
}));

describe('UserPanel', () => {
    beforeEach(() => jest.clearAllMocks());

    test('Should display some menu items', async () => {
        render(
            <BrowserRouter>
                <UserPanel visible onHide={jest.fn()} />
            </BrowserRouter>,
        );

        expect(screen.getAllByRole('menuitem').length).toBeGreaterThanOrEqual(1);
    });

    test('On click on logout, log out and redirect to home', async () => {
        render(
            <BrowserRouter>
                <UserPanel visible onHide={jest.fn()} />
            </BrowserRouter>,
        );

        const logoutLink = screen.getByRole('menuitem', {name: /logout/});

        await userEvent.click(logoutLink);

        expect(mockLogout).toHaveBeenCalled();
    });

    test('Can switch language', async () => {
        const mockUpdateLang = jest.fn();
        jest.spyOn(useLang, 'default').mockImplementation(() => ({
            lang: [AvailableLanguage.en],
            availableLangs: [AvailableLanguage.fr, AvailableLanguage.en],
            defaultLang: AvailableLanguage.en,
            setLang: mockUpdateLang,
        }));

        render(
            <BrowserRouter>
                <UserPanel visible onHide={jest.fn()} />
            </BrowserRouter>,
        );

        expect(screen.getByRole('button', {name: /🇫🇷/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /🇬🇧/})).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', {name: /🇫🇷/}));

        expect(mockUpdateLang).toHaveBeenCalled();
    });
});
