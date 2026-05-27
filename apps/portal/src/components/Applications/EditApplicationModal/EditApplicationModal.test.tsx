import * as leavUi from '@leav/ui';
import {render, screen} from '../../../_tests/testUtils';
import EditApplicationModal from './EditApplicationModal';

describe('EditApplicationModal', () => {
    test('Show EditApplication', async () => {
        // Mock EditApplication from @leav/ui
        vi.spyOn(leavUi, 'EditApplication').mockImplementation(() => <div>EditApplication</div>);

        const mockOnClose = vi.fn();
        render(<EditApplicationModal open onClose={mockOnClose} />);

        expect(screen.getByText(/new_app/)).toBeInTheDocument();
        expect(screen.getByText('EditApplication')).toBeInTheDocument();
    });
});
