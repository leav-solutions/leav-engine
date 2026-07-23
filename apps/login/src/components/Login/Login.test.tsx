import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {KitApp} from 'aristid-ds';
import {MemoryRouter} from 'react-router-dom';
import {type Mock} from 'vitest';
import Login from './Login';

window.matchMedia = query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
});

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual<object>('react-router-dom')),
    useParams: vi
        .fn()
        .mockReturnValueOnce({dest: '/'})
        .mockReturnValueOnce({dest: '/'})
        .mockReturnValueOnce({dest: '/my-app'})
        .mockReturnValue({}),
}));

const _renderComponent = (url = '/') =>
    render(
        <KitApp>
            <MemoryRouter initialEntries={[url]} future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
                <Login />
            </MemoryRouter>
        </KitApp>,
    );

const _enterCredentialsAndSubmit = () => {
    userEvent.type(screen.getByRole('textbox', {name: /login/}), 'admin');
    userEvent.type(screen.getByLabelText(/password/), 'mypwd');
    userEvent.click(screen.getByRole('button', {name: /submit/}));
};

describe('Login', () => {
    const {location} = window;
    const mockLocation: Location = {...location, replace: vi.fn(), search: ''};

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

    test('Type credentials in login form and redirects to root', async () => {
        (fetch as Mock) = vi.fn().mockReturnValue({
            status: 200,
            ok: true,
            json: async () => ({
                refreshToken: 'refreshToken',
            }),
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
        (fetch as Mock) = vi.fn().mockReturnValue({
            status: 200,
            ok: true,
            json: async () => ({
                refreshToken: 'refreshToken',
            }),
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
        (fetch as Mock) = vi.fn().mockReturnValue({
            status: 401,
            ok: false,
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
        (fetch as Mock) = vi.fn().mockReturnValue({
            status: 500,
            ok: false,
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
