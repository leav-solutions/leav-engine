import {render, screen} from '../../../_tests/testUtils';
import AvailableSoon from './AvailableSoon';

describe('AvailableSoon', () => {
    test('Should render', async () => {
        render(<AvailableSoon />);

        expect(screen.getByText(/SOON/)).toBeInTheDocument();
    });
});
