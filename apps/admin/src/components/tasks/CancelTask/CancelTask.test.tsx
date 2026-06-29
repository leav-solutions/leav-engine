import {act, render, screen} from '../../../_tests/testUtils';
import CancelTask from './CancelTask';
import {mockTask} from '../../../__mocks__/task';

vi.mock('../../../hooks/useLang');

describe('CancelTask', () => {
    test('Render delete button for tasks', async () => {
        await act(async () => {
            render(<CancelTask task={mockTask} onCancel={() => vi.fn()} />);
        });

        expect(screen.getByRole('button')).toBeEnabled();
    });
});
