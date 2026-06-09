import {render, screen} from '../../../../../_tests/testUtils';
import CustomConfigTab from './CustomConfigTab';

vi.mock('jsoneditor-react', () => ({
    JsonEditor() {
        return <div>JsonEditor</div>;
    },
}));

describe('CustomConfig', () => {
    test('Render test', async () => {
        render(<CustomConfigTab library={null} />);

        expect(screen.getByText('JsonEditor')).toBeInTheDocument();
    });
});
