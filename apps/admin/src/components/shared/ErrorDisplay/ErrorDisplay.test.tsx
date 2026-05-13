import {act, render, screen} from '../../../_tests/testUtils';
import ErrorDisplay from './ErrorDisplay';

describe('ErrorDisplay', () => {
    test('Display error', async () => {
        await act(async () => {
            render(<ErrorDisplay message="my_error_message" />);
        });

        const element = screen.getByText('my_error_message');

        expect(element).toBeInTheDocument();
    });
});
