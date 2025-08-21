// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import {mockCommonFormElementProps, mockFormElementTextBlock} from '_ui/__mocks__/common/form';
import TextBlock from './TextBlock';

describe('TextBlock', () => {
    test('Render text block with markdown converted', async () => {
        render(<TextBlock {...mockCommonFormElementProps} element={mockFormElementTextBlock} />);

        expect(screen.getByText(/text content/i)).toBeInTheDocument();
        expect(screen.getByText('text content')).toHaveStyle('font-weight: bold');
    });
});
