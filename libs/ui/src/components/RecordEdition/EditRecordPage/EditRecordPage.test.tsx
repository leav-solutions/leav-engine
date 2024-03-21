// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {screen, render} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {EditRecordPage} from './EditRecordPage';

jest.mock('../EditRecord', () => ({
    EditRecord: ({record, onCreate}) => {
        return (
            <div>
                {record ? 'EditRecord' : 'CreateRecord'}
                <button onClick={() => onCreate(mockRecord)}>simulate_create_record</button>
            </div>
        );
    }
}));

describe('EditRecordPage', () => {
    let user: ReturnType<typeof userEvent.setup>;
    beforeEach(() => {
        user = userEvent.setup();
    });

    test('Display page in create mode', async () => {
        render(<EditRecordPage library="test_lib" onClose={jest.fn()} record={null} />);

        expect(screen.getByText('CreateRecord')).toBeInTheDocument();
        expect(screen.getByText(/new_record/)).toBeInTheDocument();
        expect(screen.getByLabelText('refresh')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /cancel/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /create$/})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /create_and_edit/})).not.toBeInTheDocument();
    });

    test('Display page in create mode with all submit buttons', async () => {
        render(
            <EditRecordPage
                library="test_lib"
                onClose={jest.fn()}
                record={null}
                submitButtons={['create', 'createAndEdit']}
            />
        );

        expect(screen.getByLabelText('refresh')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /cancel/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /create$/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /create_and_edit/})).toBeInTheDocument();
    });

    test('Display page in create mode with "create and edit" button only', async () => {
        render(
            <EditRecordPage library="test_lib" onClose={jest.fn()} record={null} submitButtons={['createAndEdit']} />
        );

        expect(screen.getByLabelText('refresh')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /cancel/})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /create$/})).not.toBeInTheDocument();
        expect(screen.getByRole('button', {name: /create_and_edit/})).toBeInTheDocument();
    });

    test('Refresh form in edit mode after "create and edit"', async () => {
        const onCreateAndEdit = jest.fn();
        const onCreate = jest.fn();
        render(
            <EditRecordPage
                library="test_lib"
                onClose={jest.fn()}
                record={null}
                submitButtons={['createAndEdit']}
                onCreate={onCreate}
                onCreateAndEdit={onCreateAndEdit}
            />
        );

        expect(screen.getByLabelText('refresh')).toBeInTheDocument();
        expect(screen.getByText('CreateRecord')).toBeInTheDocument();

        await user.click(screen.getByText('simulate_create_record'));

        expect(screen.getByText('EditRecord')).toBeInTheDocument();
    });

    test('Display page in edit mode', async () => {
        render(<EditRecordPage library="test_lib" onClose={jest.fn()} record={mockRecord} />);

        expect(screen.getByText('EditRecord')).toBeInTheDocument();
        expect(screen.getByText(mockRecord.label)).toBeInTheDocument();
        expect(screen.getByLabelText('refresh')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /close/})).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /create$/})).not.toBeInTheDocument();
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
