// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '../../_tests/testUtils';
import {SimpleErrorBoundary} from './SimpleErrorBoundary';

let isDevEnvMock: boolean;
jest.mock('_ui/_utils/isDevEnv', () => ({
    isDevEnv: () => isDevEnvMock
}));

describe('SimpleErrorBoundary', () => {
    const ComponentWithError = () => {
        throw new Error('boom!');
    };

    test('Should display error', async () => {
        isDevEnvMock = false;
        render(
            <SimpleErrorBoundary>
                <ComponentWithError />
            </SimpleErrorBoundary>
        );

        expect(screen.getByText(/error_occurred/)).toBeVisible();
        expect(screen.queryByText(/boom!/)).not.toBeInTheDocument();
    });

    test('Should display details message on local only', async () => {
        isDevEnvMock = true;
        render(
            <SimpleErrorBoundary>
                <ComponentWithError />
            </SimpleErrorBoundary>
        );

        expect(screen.getByText(/error_occurred/)).toBeVisible();
        expect(screen.getByText(/boom!/)).toBeInTheDocument();
    });
});
