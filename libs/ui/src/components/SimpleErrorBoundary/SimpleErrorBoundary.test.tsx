import {render, screen} from '../../_tests/testUtils';
import {SimpleErrorBoundary} from './SimpleErrorBoundary';

let isDevEnvMock: boolean;
vi.mock('_ui/_utils/isDevEnv', () => ({
    isDevEnv: () => isDevEnvMock,
}));

let consoleSpy;

describe('SimpleErrorBoundary', () => {
    const ComponentWithError = () => {
        throw new Error('boom!');
    };

    beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null);
    });
    afterEach(() => {
        consoleSpy.mockRestore();
    });

    test('Should display error', async () => {
        isDevEnvMock = false;
        render(
            <SimpleErrorBoundary>
                <ComponentWithError />
            </SimpleErrorBoundary>,
        );

        expect(screen.getByText(/error_occurred/)).toBeVisible();
        expect(screen.queryByText(/boom!/)).not.toBeInTheDocument();
    });

    test('Should display details message on local only', async () => {
        isDevEnvMock = true;
        render(
            <SimpleErrorBoundary>
                <ComponentWithError />
            </SimpleErrorBoundary>,
        );

        expect(screen.getByText(/error_occurred/)).toBeVisible();
        expect(screen.getByText(/boom!/)).toBeInTheDocument();
    });
});
