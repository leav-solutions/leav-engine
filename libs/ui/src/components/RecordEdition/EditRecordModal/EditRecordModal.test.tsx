// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {screen, render} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {EditRecordModal} from './EditRecordModal';
import {Form} from 'antd';

let user!: ReturnType<typeof userEvent.setup>;

jest.mock('../EditRecord', () => ({
    EditRecord: ({antdForm, record, onCreate}) => {
        const fields = [{name: 'leonbloum', value: record ? 'EditRecord' : 'CreateRecord'}];
        return (
            <Form form={antdForm} fields={fields}>
                <Form.Item name="leonbloum">
                    <input />
                </Form.Item>
                <button onClick={() => onCreate(mockRecord)}>simulate_create_record</button>
            </Form>
        );
    }
}));

describe('EditRecordModal', () => {
    beforeEach(() => {
        user = userEvent.setup();
    });

    describe('create mode', () => {
        test('Display modal in create mode', async () => {
            render(<EditRecordModal open library="test_lib" onClose={jest.fn()} record={null} />);

            expect(screen.getByDisplayValue('CreateRecord')).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /cancel/})).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /create$/})).toBeInTheDocument();
        });

        test('Display modal in create mode with all submit buttons', async () => {
            render(
                <EditRecordModal
                    open
                    library="test_lib"
                    onClose={jest.fn()}
                    record={null}
                    submitButtons={['create', 'createAndEdit']}
                />
            );

            expect(screen.getByRole('button', {name: /cancel/})).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /create$/})).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /create_and_edit/})).toBeInTheDocument();
        });

        test('Display modal in create mode with "create and edit" button only', async () => {
            render(
                <EditRecordModal
                    open
                    library="test_lib"
                    onClose={jest.fn()}
                    record={null}
                    submitButtons={['createAndEdit']}
                />
            );

            expect(screen.getByRole('button', {name: /cancel/})).toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /create$/})).not.toBeInTheDocument();
            expect(screen.getByRole('button', {name: /create_and_edit/})).toBeInTheDocument();
        });

        test('Should call onClose on click on cancel if antd fields are not touched', async () => {
            const mockOnClose = jest.fn();
            render(<EditRecordModal open library="test_lib" onClose={mockOnClose} record={null} />);

            await userEvent.click(screen.getByRole('button', {name: 'global.cancel'}));
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        test('Should call onClose if some fields are touched on confirm', async () => {
            const mockOnClose = jest.fn();
            render(<EditRecordModal open library="test_lib" onClose={mockOnClose} record={null} />);

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
        test('Display modal in edit mode', async () => {
            render(<EditRecordModal open library="test_lib" onClose={jest.fn()} record={mockRecord} />);

            expect(screen.getByDisplayValue('EditRecord')).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /close/})).toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /submit/})).not.toBeInTheDocument();
        });

        test('Refresh form in edit mode after "create and edit"', async () => {
            const onCreateAndEdit = jest.fn();
            const onCreate = jest.fn();
            render(
                <EditRecordModal
                    open
                    library="test_lib"
                    onClose={jest.fn()}
                    record={null}
                    submitButtons={['createAndEdit']}
                    onCreate={onCreate}
                    onCreateAndEdit={onCreateAndEdit}
                />
            );

            expect(screen.getByDisplayValue('CreateRecord')).toBeInTheDocument();

            await user.click(screen.getByText('simulate_create_record'));

            expect(screen.getByDisplayValue('EditRecord')).toBeInTheDocument();
        });

        test('Should not open modal on click on close', async () => {
            const mockOnClose = jest.fn();
            render(<EditRecordModal open library="test_lib" onClose={mockOnClose} record={mockRecord} />);

            expect(
                screen.queryByRole('heading', {level: 2, name: 'record_edition.cancel_confirm_modal_title'})
            ).not.toBeInTheDocument();
            await userEvent.type(screen.getByDisplayValue('EditRecord'), 'Something');
            await userEvent.click(screen.getByRole('button', {name: 'global.close'}));

            expect(screen.queryByText('record_edition.cancel_confirm_modal_title')).not.toBeInTheDocument();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });
});
