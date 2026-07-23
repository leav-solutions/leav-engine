import {render, screen} from '_ui/_tests/testUtils';
import {mockCommonFormElementProps, mockFormElementTextBlock} from '_ui/__mocks__/common/form';
import TextBlock from './TextBlock';

describe('TextBlock', () => {
    test('Render text block with markdown converted', async () => {
        // react-markdown@5 still uses defaultProps on function components, which React 18.3 deprecates.
        // Third-party legacy we can't fix here — ignore only that exact warning for this render.
        const originalConsoleError = console.error.bind(console);
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
            const isReactMarkdownDefaultPropsWarning =
                typeof args[0] === 'string' &&
                args[0].includes('Support for defaultProps will be removed') &&
                args.some(arg => typeof arg === 'string' && arg.includes('ReactMarkdown'));
            if (!isReactMarkdownDefaultPropsWarning) {
                originalConsoleError(...args);
            }
        });

        render(<TextBlock {...mockCommonFormElementProps} element={mockFormElementTextBlock} />);

        expect(screen.getByText(/text content/i)).toBeInTheDocument();
        expect(screen.getByText('text content').tagName).toBe('STRONG');

        consoleErrorSpy.mockRestore();
    });
});
