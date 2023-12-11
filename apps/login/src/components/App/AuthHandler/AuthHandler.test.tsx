// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import * as useAuthChecker from 'hooks/useAuthChecker';
import * as useRedirectToDest from 'hooks/useRedirectToDest';
import AuthHandler from './AuthHandler';

jest.mock('hooks/useRedirectToDest', () => ({
    useRedirectToDest: jest.fn().mockReturnValue({
        redirectToDest: jest.fn()
    })
}));

describe('AuthHandler', () => {
    const mockRedirectToDest = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    beforeAll(() => {
        jest.spyOn(useRedirectToDest, 'useRedirectToDest').mockReturnValue({
            redirectToDest: mockRedirectToDest
        });
    });

    test('If user already authenticated, redirect to dest', async () => {
        jest.spyOn(useAuthChecker, 'useAuthChecker').mockReturnValue('success');

        render(<AuthHandler>Test</AuthHandler>);

        expect(useAuthChecker.useAuthChecker).toHaveBeenCalled();
        expect(mockRedirectToDest).toHaveBeenCalled();
    });

    test('If user not already authenticated, render login form', async () => {
        jest.spyOn(useAuthChecker, 'useAuthChecker').mockReturnValue('fail');

        render(
            <AuthHandler>
                <div>Login Form</div>
            </AuthHandler>
        );

        expect(useAuthChecker.useAuthChecker).toHaveBeenCalled();
        expect(mockRedirectToDest).not.toHaveBeenCalled();
        expect(screen.getByText('Login Form')).toBeInTheDocument();
    });
});
