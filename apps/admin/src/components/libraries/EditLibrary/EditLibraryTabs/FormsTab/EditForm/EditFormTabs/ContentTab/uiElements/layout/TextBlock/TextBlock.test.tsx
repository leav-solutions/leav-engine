import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';
import TextBlock from './TextBlock';

describe('TextBlock', () => {
    test('Convert markdown to plain text', async () => {
        render(<TextBlock settings={{content: '**test_content**'}} />);

        expect(screen.getByTestId('text-block-content')).toHaveTextContent('test_content');
        expect(screen.getByText('test_content').tagName).toBe('STRONG');
    });
});
