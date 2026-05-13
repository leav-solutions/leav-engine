import {render, screen} from '../../../../../_tests/testUtils';
import CustomConfigTab from './CustomConfigTab';

jest.mock('jsoneditor-react', () => ({
    JsonEditor() {
        return <div>JsonEditor</div>;
    },
}));

describe('CustomConfigTab', () => {
    test('Render test', async () => {
        render(<CustomConfigTab tree={null} />);

        expect(screen.getByText('JsonEditor')).toBeInTheDocument();
    });
});
