// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {screen, render} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {EditRecordPage} from './EditRecordPage';

jest.mock('../EditRecord', () => ({
    EditRecord: () => <div>EditRecord</div>
}));

describe('EditRecordPage', () => {
    test('Display page in create mode', async () => {
        render(<EditRecordPage library="test_lib" onClose={jest.fn()} record={null} />);

        expect(screen.getByText('EditRecord')).toBeInTheDocument();
        expect(screen.getByText(/new_record/)).toBeInTheDocument();
        expect(screen.getByLabelText('refresh')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /cancel/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /submit/})).toBeInTheDocument();
    });

    test('Display page in edit mode', async () => {
        render(<EditRecordPage library="test_lib" onClose={jest.fn()} record={mockRecord} />);

        expect(screen.getByText('EditRecord')).toBeInTheDocument();
        expect(screen.getByText(mockRecord.label)).toBeInTheDocument();
        expect(screen.getByLabelText('refresh')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /close/})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /submit/})).not.toBeInTheDocument();
    });

    test('Should display a custom title', async () => {
        render(<EditRecordPage library="test_lib" onClose={jest.fn()} record={mockRecord} title={'Custom title'} />);

        expect(screen.getByText('Custom title')).toBeInTheDocument();
    });

    test('Should hide refresh button if showRefreshButton is set to false', async () => {
        render(
            <EditRecordPage
                library="test_lib"
                onClose={jest.fn()}
                record={mockRecord}
                title={'Custom title'}
                showRefreshButton={false}
            />
        );

        expect(screen.queryByLabelText('refresh')).not.toBeInTheDocument();
    });
});
