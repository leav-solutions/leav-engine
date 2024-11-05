// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {screen, render} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {EditRecordPage} from './EditRecordPage';
import {Form} from 'antd';

let user!: ReturnType<typeof userEvent.setup>;

jest.mock('../EditRecord', () => ({
    EditRecord: ({antdForm, record, onCreate}) => {
        const fields = [{name: 'jeanjau', value: record ? 'EditRecord' : 'CreateRecord'}];
        return (
            <Form form={antdForm} fields={fields}>
                <Form.Item name="jeanjau">
                    <input />
                </Form.Item>
                <button onClick={() => onCreate(mockRecord)}>simulate_create_record</button>
            </Form>
        );
    }
}));

describe('EditRecordPage', () => {
    beforeEach(() => {
        user = userEvent.setup();
    });

    describe('create mode', () => {
        test('Display page in create mode', async () => {
            render(<EditRecordPage library="test_lib" onClose={jest.fn()} record={null} />);

            expect(screen.getByDisplayValue('CreateRecord')).toBeInTheDocument();
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
                <EditRecordPage
                    library="test_lib"
                    onClose={jest.fn()}
                    record={null}
                    submitButtons={['createAndEdit']}
                />
            );

            expect(screen.getByLabelText('refresh')).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /cancel/})).toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /create$/})).not.toBeInTheDocument();
            expect(screen.getByRole('button', {name: /create_and_edit/})).toBeInTheDocument();
        });

        test('Should call onClose  if fields are not touched on cancel', async () => {
            const mockOnClose = jest.fn();
            render(<EditRecordPage library="test_lib" onClose={mockOnClose} record={null} />);

            await userEvent.click(screen.getByRole('button', {name: 'global.cancel'}));
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        test('Should open modal and call onClose on click on confirm if antd fields are touched', async () => {
            const mockOnClose = jest.fn();
            render(<EditRecordPage library="test_lib" onClose={mockOnClose} record={null} />);

            expect(
                screen.queryByRole('heading', {level: 2, name: 'record_edition.cancel_confirm_modal_title'})
            ).not.toBeInTheDocument();
            await userEvent.type(screen.getByDisplayValue('CreateRecord'), 'Something');
            await userEvent.click(screen.getByRole('button', {name: 'global.cancel'}));

            expect(screen.queryByText('record_edition.cancel_confirm_modal_title')).toBeInTheDocument();
            expect(mockOnClose).not.toHaveBeenCalled();

            await userEvent.click(screen.queryByText('global.confirm'));
            expect(screen.queryByText('record_edition.cancel_confirm_modal_title')).not.toBeInTheDocument();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe('edit mode', () => {
        test('Display page in edit mode', async () => {
            render(<EditRecordPage library="test_lib" onClose={jest.fn()} record={mockRecord} />);

            expect(screen.getByDisplayValue('EditRecord')).toBeInTheDocument();
            expect(screen.getByText(mockRecord.label)).toBeInTheDocument();
            expect(screen.getByLabelText('refresh')).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /close/})).toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /submit/})).not.toBeInTheDocument();
        });

        test('Should display a custom title', async () => {
            render(
                <EditRecordPage library="test_lib" onClose={jest.fn()} record={mockRecord} title="Custom title" />
            );

            expect(screen.getByText('Custom title')).toBeInTheDocument();
        });

        test('Should hide refresh button if showRefreshButton is set to false', async () => {
            render(
                <EditRecordPage
                    library="test_lib"
                    onClose={jest.fn()}
                    record={mockRecord}
                    title="Custom title"
                    showRefreshButton={false}
                />
            );

            expect(screen.queryByLabelText('refresh')).not.toBeInTheDocument();
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
            expect(screen.getByDisplayValue('CreateRecord')).toBeInTheDocument();

            await user.click(screen.getByText('simulate_create_record'));

            expect(await screen.findByDisplayValue('EditRecord')).toBeInTheDocument();
        });
    });

    test('Should hide refresh button if showRefreshButton is set to false', async () => {
        render(
            <EditRecordPage
                library="test_lib"
                onClose={jest.fn()}
                record={mockRecord}
                title="Custom title"
                showRefreshButton={false}
            />
        );

        expect(screen.queryByLabelText('refresh')).not.toBeInTheDocument();
    });
});
