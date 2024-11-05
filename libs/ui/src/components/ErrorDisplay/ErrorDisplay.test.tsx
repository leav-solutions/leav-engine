// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import ErrorDisplay from './ErrorDisplay';

describe('ErrorDisplay', () => {
    test('Display error', async () => {
        render(<ErrorDisplay message="my_error_message" />);

        const element = screen.getByText('my_error_message');

        expect(element).toBeInTheDocument();
    });
});
