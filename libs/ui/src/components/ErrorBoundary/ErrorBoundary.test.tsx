// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '../../_tests/testUtils';
import {ErrorBoundary} from './ErrorBoundary';

describe('ErrorBoundary', () => {
    beforeAll(() => jest.spyOn(console, 'error').mockImplementation(jest.fn()));
    afterAll(() => (console.error as jest.Mock).mockRestore());

    const ComponentWithError = () => {
        throw new Error('boom!');
    };

    test('Display proper error message with recovery buttons', async () => {
        render(
            <ErrorBoundary>
                <ComponentWithError />
            </ErrorBoundary>
        );

        expect(screen.getByText(/error_occurred/)).toBeInTheDocument();
        expect(screen.getByText(/boom!/)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /refresh/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /go_back/i})).toBeInTheDocument();
    });

    test('Display error message without recovery buttons', async () => {
        render(
            <ErrorBoundary showRecoveryButtons={false}>
                <ComponentWithError />
            </ErrorBoundary>
        );

        expect(screen.queryByRole('button', {name: /refresh/i})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /go_back/i})).not.toBeInTheDocument();
    });
});
