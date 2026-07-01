import {fireEvent, render, screen} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import EditRecordBtn from './EditRecordBtn';

vi.mock('../EditRecordModal', () => ({
    EditRecordModal: () => <div>EditRecordModal</div>,
}));

describe('EditRecordBtn', () => {
    test('Display button', async () => {
        render(<EditRecordBtn record={mockRecord} size="small" />);

        expect(screen.getByRole('button', {name: 'edit-record'})).toBeInTheDocument();
    });

    test('Open modal on click', async () => {
        render(<EditRecordBtn record={mockRecord} size="small" />);

        const btn = screen.getByRole('button', {name: 'edit-record'});

        fireEvent.click(btn);

        expect(screen.getByText('EditRecordModal')).toBeVisible();
    });
});
