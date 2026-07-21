import {Button} from 'antd';
import {render, screen, suppressUncaughtError} from '../../_tests/testUtils';
import {ErrorBoundary} from './ErrorBoundary';
import {type FunctionComponent} from 'react';

let isDevEnvMock: boolean;
vi.mock('_ui/_utils/isDevEnv', () => ({
    isDevEnv: () => isDevEnvMock,
}));

let consoleSpy;
let restoreUncaughtError: () => void;

describe('ErrorBoundary', () => {
    const ComponentWithError: FunctionComponent = () => {
        throw new Error('boom!');
    };

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null);
        restoreUncaughtError = suppressUncaughtError('boom!');
    });
    afterEach(() => {
        consoleSpy.mockRestore();
        restoreUncaughtError();
    });

    describe('in production build', () => {
        beforeEach(() => {
            isDevEnvMock = false;
        });
        test('Should display recovery buttons', async () => {
            const buttons = [<Button key="refresh">refresh</Button>, <Button key="go_back">go_back</Button>];

            render(
                <ErrorBoundary recoveryButtons={buttons}>
                    <ComponentWithError />
                </ErrorBoundary>,
            );

            expect(screen.getByText(/error_occurred/)).toBeInTheDocument();
            expect(screen.queryByText(/boom!/)).not.toBeInTheDocument();
            expect(screen.getByRole('button', {name: /refresh/i})).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /go_back/i})).toBeInTheDocument();
        });

        test('Should display error', async () => {
            render(
                <ErrorBoundary>
                    <ComponentWithError />
                </ErrorBoundary>,
            );

            expect(screen.getByText(/error_occurred/)).toBeInTheDocument();
            expect(screen.queryByText(/boom!/)).not.toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /refresh/i})).not.toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /go_back/i})).not.toBeInTheDocument();
        });
    });

    describe('in local build', () => {
        beforeEach(() => {
            isDevEnvMock = true;
        });
        test('Should display proper error message with recovery buttons', async () => {
            const buttons = [<Button key="refresh">refresh</Button>, <Button key="go_back">go_back</Button>];

            render(
                <ErrorBoundary recoveryButtons={buttons}>
                    <ComponentWithError />
                </ErrorBoundary>,
            );

            expect(screen.getByText(/error_occurred/)).toBeInTheDocument();
            expect(screen.getByText(/boom!/)).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /refresh/i})).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /go_back/i})).toBeInTheDocument();
        });

        test('Should display error message without recovery buttons', async () => {
            render(
                <ErrorBoundary>
                    <ComponentWithError />
                </ErrorBoundary>,
            );

            expect(screen.getByText(/error_occurred/)).toBeInTheDocument();
            expect(screen.getByText(/boom!/)).toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /refresh/i})).not.toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /go_back/i})).not.toBeInTheDocument();
        });
    });
});
