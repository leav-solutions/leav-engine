import * as leavUi from '@leav/ui';
import userEvent from '@testing-library/user-event';
import {BrowserRouter} from 'react-router-dom';
import {render, screen, waitFor} from '../../_tests/testUtils';
import UserPanel from './UserPanel';

const mockDeleteToken = jest.fn();
jest.mock('@leav/utils', () => ({
    ...jest.requireActual('@leav/utils'),
    useAuthToken: jest.fn(() => ({
        getToken: jest.fn(),
        saveToken: jest.fn(),
        deleteToken: mockDeleteToken,
    })),
}));

describe('UserPanel', () => {
    const {location} = window;
    const mockLocation: Location = {...location, reload: jest.fn(), search: ''};

    beforeAll(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            writable: true,
            value: mockLocation,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        // Restore original window.location after tests
        Object.defineProperty(window, 'location', {
            configurable: true,
            writable: true,
            value: location,
        });
    });

    test('Should display some menu items', async () => {
        render(
            <BrowserRouter>
                <UserPanel userPanelVisible hideUserPanel={jest.fn()} />
            </BrowserRouter>,
        );

        expect(screen.getAllByRole('menuitem').length).toBeGreaterThanOrEqual(1);
    });

    test('On click on logout, log out and redirect to home', async () => {
        const mockLogout = jest.fn();

        jest.spyOn(leavUi, 'useAuth').mockImplementation(() => ({
            logout: mockLogout,
        }));

        render(
            <BrowserRouter>
                <UserPanel userPanelVisible hideUserPanel={jest.fn()} />
            </BrowserRouter>,
        );

        const logoutLink = screen.getByRole('menuitem', {name: /logout/});

        userEvent.click(logoutLink);

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
        });
    });

    test('Can switch language', async () => {
        const mockUpdateLang = jest.fn();
        jest.spyOn(leavUi, 'useLang').mockImplementation(() => ({
            lang: ['en'],
            availableLangs: ['fr', 'en'],
            defaultLang: 'en',
            setLang: mockUpdateLang,
        }));

        render(
            <BrowserRouter>
                <UserPanel userPanelVisible hideUserPanel={jest.fn()} />
            </BrowserRouter>,
        );

        expect(screen.getByRole('button', {name: /🇫🇷/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /🇬🇧/})).toBeInTheDocument();

        userEvent.click(screen.getByRole('button', {name: /🇫🇷/}));

        await waitFor(() => {
            expect(mockUpdateLang).toHaveBeenCalled();
        });
    });
});
