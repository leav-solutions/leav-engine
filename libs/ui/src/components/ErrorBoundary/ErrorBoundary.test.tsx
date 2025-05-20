// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Button} from 'antd';
import {render, screen} from '../../_tests/testUtils';
import {ErrorBoundary} from './ErrorBoundary';
import {FunctionComponent} from 'react';

let isDevEnvMock: boolean;
jest.mock('_ui/_utils/isDevEnv', () => ({
    isDevEnv: () => isDevEnvMock
}));

let consoleSpy;

describe('ErrorBoundary', () => {
    const ComponentWithError: FunctionComponent = () => {
        throw new Error('boom!');
    };

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => null);
    });
    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('in production build', () => {
        beforeEach(() => {
            isDevEnvMock = false;
        });
        test('Should display recovery buttons', async () => {
            const buttons = [<Button>refresh</Button>, <Button>go_back</Button>];

            render(
                <ErrorBoundary recoveryButtons={buttons}>
                    <ComponentWithError />
                </ErrorBoundary>
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
                </ErrorBoundary>
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
            const buttons = [<Button>refresh</Button>, <Button>go_back</Button>];

            render(
                <ErrorBoundary recoveryButtons={buttons}>
                    <ComponentWithError />
                </ErrorBoundary>
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
                </ErrorBoundary>
            );

            expect(screen.getByText(/error_occurred/)).toBeInTheDocument();
            expect(screen.getByText(/boom!/)).toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /refresh/i})).not.toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /go_back/i})).not.toBeInTheDocument();
        });
    });
});
