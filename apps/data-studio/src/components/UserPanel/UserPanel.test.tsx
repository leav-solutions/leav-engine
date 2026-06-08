import * as leavUi from '@leav/ui';
import userEvent from '@testing-library/user-event';
import {BrowserRouter} from 'react-router-dom';
import {render, screen, waitFor} from '../../_tests/testUtils';
import UserPanel from './UserPanel';

const {mockDeleteToken} = vi.hoisted(() => ({mockDeleteToken: vi.fn()}));
vi.mock('@leav/utils', async () => ({
    ...(await vi.importActual<object>('@leav/utils')),
    useAuthToken: vi.fn(() => ({
        getToken: vi.fn(),
        saveToken: vi.fn(),
        deleteToken: mockDeleteToken,
    })),
}));

describe('UserPanel', () => {
    const {location} = window;
    const mockLocation: Location = {...location, reload: vi.fn(), search: ''};

    beforeAll(() => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            writable: true,
            value: mockLocation,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
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
                <UserPanel userPanelVisible hideUserPanel={vi.fn()} />
            </BrowserRouter>,
        );

        expect(screen.getAllByRole('menuitem').length).toBeGreaterThanOrEqual(1);
    });

    test('On click on logout, log out and redirect to home', async () => {
        const mockLogout = vi.fn();

        vi.spyOn(leavUi, 'useAuth').mockImplementation(() => ({
            logout: mockLogout,
        }));

        render(
            <BrowserRouter>
                <UserPanel userPanelVisible hideUserPanel={vi.fn()} />
            </BrowserRouter>,
        );

        const logoutLink = screen.getByRole('menuitem', {name: /logout/});

        userEvent.click(logoutLink);

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
        });
    });

    test('Can switch language', async () => {
        const mockUpdateLang = vi.fn();
        vi.spyOn(leavUi, 'useLang').mockImplementation(() => ({
            lang: ['en'],
            availableLangs: ['fr', 'en'],
            defaultLang: 'en',
            setLang: mockUpdateLang,
        }));

        render(
            <BrowserRouter>
                <UserPanel userPanelVisible hideUserPanel={vi.fn()} />
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
