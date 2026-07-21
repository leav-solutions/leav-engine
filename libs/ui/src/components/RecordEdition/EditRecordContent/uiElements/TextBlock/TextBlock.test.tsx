import {render, screen} from '_ui/_tests/testUtils';
import {mockCommonFormElementProps, mockFormElementTextBlock} from '_ui/__mocks__/common/form';
import TextBlock from './TextBlock';

describe('TextBlock', () => {
    test('Render text block with markdown converted', async () => {
        render(<TextBlock {...mockCommonFormElementProps} element={mockFormElementTextBlock} />);

        expect(screen.getByText(/text content/i)).toBeInTheDocument();
        expect(screen.getByText('text content').tagName).toBe('STRONG');
    });
});
