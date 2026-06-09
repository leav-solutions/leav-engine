import {render, screen} from '../../../../../_tests/testUtils';
import CustomConfigTab from './CustomConfigTab';

vi.mock('jsoneditor-react', () => ({
    JsonEditor() {
        return <div>JsonEditor</div>;
    },
}));

describe('CustomConfigTab', () => {
    test('Render test', async () => {
        render(<CustomConfigTab attribute={null} />);

        expect(screen.getByText('JsonEditor')).toBeInTheDocument();
    });
});
