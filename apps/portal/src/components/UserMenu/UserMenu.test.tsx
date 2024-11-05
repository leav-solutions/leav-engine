// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as leavUi from '@leav/ui';
import userEvent from '@testing-library/user-event';
import UserContext from 'context/UserContext';
import {mockUser} from '_tests/mocks/user';
import {act, render, screen} from '_tests/testUtils';
import UserMenu from './UserMenu';

describe('UserMenu', () => {
    const mockLangContext: leavUi.ILangContext = {
        lang: ['en'],
        availableLangs: ['fr', 'en'],
        defaultLang: 'en',
        setLang: jest.fn()
    };

    test('Open menu and click on elements', async () => {
        const mockLogout = jest.fn();
        jest.spyOn(leavUi, 'useAuth').mockReturnValue({
            logout: mockLogout
        });

        render(
            <leavUi.LangContext.Provider value={mockLangContext}>
                <UserContext.Provider value={mockUser}>
                    <UserMenu />
                </UserContext.Provider>
            </leavUi.LangContext.Provider>
        );

        const userLabel = screen.getByText(mockUser.whoAmI.label);
        expect(userLabel).toBeInTheDocument();

        userEvent.click(userLabel);

        await act(async () => {
            userEvent.click(screen.getByText(/logout/i));
        });
        expect(mockLogout).toHaveBeenCalled();

        userEvent.click(userLabel);

        // Hover "more" to display flag actions
        // FIXME: not the cleanest way to retrieve the "more" button, but on v0.8.0 of aristid-ds,
        // the button as no accessible name we can use
        userEvent.click(screen.getByTestId('user-panel').getElementsByClassName('kit-action-more')[0]);

        userEvent.click(await screen.findByText(/en/i));
        expect(mockLangContext.setLang).toHaveBeenCalled();
    });
});
