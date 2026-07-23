import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {KitApp} from 'aristid-ds';
import {MemoryRouter} from 'react-router-dom';
import {type Mock} from 'vitest';
import ResetPassword from './ResetPassword';

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
    useParams: () => ({token: '123456'}),
}));

const _renderComponent = (url = '/') =>
    render(
        <KitApp>
            <MemoryRouter initialEntries={[url]} future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
                <ResetPassword />
            </MemoryRouter>
        </KitApp>,
    );

const _enterPasswordsAndSubmit = () => {
    userEvent.type(screen.getByLabelText(/new_password/), 'password');
    userEvent.type(screen.getByLabelText(/confirm_password/), 'password');
    userEvent.click(screen.getByRole('button', {name: /submit/}));
};

describe('ResetPassword', () => {
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

    test('Type passwords in form and redirects to root', async () => {
        (fetch as Mock) = vi.fn().mockReturnValue({
            status: 200,
            ok: true,
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
        (fetch as Mock) = vi.fn().mockReturnValue({
            status: 401,
            ok: false,
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
        (fetch as Mock) = vi.fn().mockReturnValue({
            status: 422,
            ok: false,
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
