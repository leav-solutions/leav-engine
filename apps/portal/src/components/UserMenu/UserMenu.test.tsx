// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ILangContext, LangContext} from '@leav/ui';
import userEvent from '@testing-library/user-event';
import UserContext from 'context/UserContext';
import {mockUser} from '_tests/mocks/user';
import {act, render, screen} from '_tests/testUtils';
import UserMenu from './UserMenu';

const mockLogout = jest.fn();
jest.mock('hooks/useAuth/useAuth', () => () => ({
    logout: mockLogout
}));

describe('UserMenu', () => {
    const mockLangContext: ILangContext = {
        lang: ['fr'],
        availableLangs: ['fr', 'en'],
        defaultLang: 'fr',
        setLang: jest.fn()
    };

    test('Open menu and click on elements', async () => {
        render(
            <LangContext.Provider value={mockLangContext}>
                <UserContext.Provider value={mockUser}>
                    <UserMenu />
                </UserContext.Provider>
            </LangContext.Provider>
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
        userEvent.click(screen.getByRole('img', {name: 'more', hidden: true}));

        userEvent.click(await screen.findByText(/fr/i));
        expect(mockLangContext.setLang).toHaveBeenCalled();
    });
});
