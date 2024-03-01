// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {screen, render} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {EditRecordModal} from './EditRecordModal';

jest.mock('../EditRecord', () => ({
    EditRecord: () => <div>EditRecord</div>
}));

describe('EditRecordModal', () => {
    test('Display modal in create mode', async () => {
        render(<EditRecordModal open library="test_lib" onClose={jest.fn()} record={null} />);

        expect(screen.getByText('EditRecord')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /close/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /submit/})).toBeInTheDocument();
    });

    test('Display modal in edit mode', async () => {
        render(<EditRecordModal open library="test_lib" onClose={jest.fn()} record={mockRecord} />);

        expect(screen.getByText('EditRecord')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /close/})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /submit/})).not.toBeInTheDocument();
    });
});
