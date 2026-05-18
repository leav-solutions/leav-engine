import {render, screen} from '@testing-library/react';
import * as useAuthChecker from '../../../hooks/useAuthChecker';
import * as useRedirectToDest from '../../../hooks/useRedirectToDest';
import AuthHandler from './AuthHandler';

vi.mock('../../../hooks/useRedirectToDest', () => ({
    useRedirectToDest: vi.fn().mockReturnValue({redirectToDest: vi.fn()}),
}));

describe('AuthHandler', () => {
    const mockRedirectToDest = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    beforeAll(() => {
        vi.spyOn(useRedirectToDest, 'useRedirectToDest').mockReturnValue({redirectToDest: mockRedirectToDest});
    });

    test('If user already authenticated, redirect to dest', async () => {
        vi.spyOn(useAuthChecker, 'useAuthChecker').mockReturnValue('success');

        render(<AuthHandler>Test</AuthHandler>);

        expect(useAuthChecker.useAuthChecker).toHaveBeenCalled();
        expect(mockRedirectToDest).toHaveBeenCalled();
    });

    test('If user not already authenticated, render login form', async () => {
        vi.spyOn(useAuthChecker, 'useAuthChecker').mockReturnValue('fail');

        render(
            <AuthHandler>
                <div>Login Form</div>
            </AuthHandler>,
        );

        expect(useAuthChecker.useAuthChecker).toHaveBeenCalled();
        expect(mockRedirectToDest).not.toHaveBeenCalled();
        expect(screen.getByText('Login Form')).toBeInTheDocument();
    });
});
