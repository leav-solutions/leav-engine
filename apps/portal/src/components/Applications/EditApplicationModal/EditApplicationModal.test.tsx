// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as leavUi from '@leav/ui';
import {render, screen} from '_tests/testUtils';
import EditApplicationModal from './EditApplicationModal';

describe('EditApplicationModal', () => {
    test('Show EditApplication', async () => {
        // Mock EditApplication from @leav/ui
        jest.spyOn(leavUi, 'EditApplication').mockImplementation(() => <div>EditApplication</div>);

        const mockOnClose = jest.fn();
        render(<EditApplicationModal open onClose={mockOnClose} />);

        expect(screen.getByText(/new_app/)).toBeInTheDocument();
        expect(screen.getByText('EditApplication')).toBeInTheDocument();
    });
});
