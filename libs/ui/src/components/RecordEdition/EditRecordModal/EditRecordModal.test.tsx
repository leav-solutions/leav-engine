import userEvent from '@testing-library/user-event';
import {screen, render, waitFor} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {EditRecordModal} from './EditRecordModal';
import {Form} from 'antd';
import ReactModal from 'react-modal';
import * as gqlTypes from '_ui/_gqlTypes';

let user!: ReturnType<typeof userEvent.setup>;

const editRecordFn = jest.fn();
jest.mock('../EditRecord', () => ({
    EditRecord: ({antdForm, formElementId, isFormCreationMode, onCreate, ...props}) => {
        editRecordFn(props);
        const fields = [{name: 'leonbloum', value: !isFormCreationMode ? 'EditRecord' : 'CreateRecord'}];
        return (
            <Form form={antdForm} id={formElementId} fields={fields} onFinish={() => onCreate(mockRecord)}>
                <Form.Item name="leonbloum">
                    <input />
                </Form.Item>
                <button onClick={() => onCreate(mockRecord)}>simulate_create_record</button>
            </Form>
        );
    },
}));

describe('EditRecordModal', () => {
    let mockUseCreateRecordMutation = jest.fn();
    let mockUsePurgeRecordMutation = jest.fn();

    beforeEach(() => {
        user = userEvent.setup();
        ReactModal.setAppElement(document.createElement('div'));

        mockUseCreateRecordMutation = jest.fn().mockReturnValue({
            data: {
                createRecord: {
                    record: {
                        id: 'new_record_id',
                        whoAmI: {
                            id: 'new_record_id',
                            label: 'New Record',
                            library: {id: 'test_lib'},
                        },
                    },
                },
            },
        });
        mockUsePurgeRecordMutation = jest.fn().mockReturnValue({
            data: {
                purgeRecord: {
                    record: {
                        id: 'new_record_id',
                    },
                },
            },
        });
        jest.spyOn(gqlTypes, 'useCreateRecordMutation').mockImplementation(() => [
            mockUseCreateRecordMutation,
            {loading: false, called: false, client: null, reset: null, error: null},
        ]);
        jest.spyOn(gqlTypes, 'usePurgeRecordMutation').mockImplementation(() => [
            mockUsePurgeRecordMutation,
            {loading: false, called: false, client: null, reset: null, error: null},
        ]);
    });

    afterEach(() => {
        mockUseCreateRecordMutation.mockReset();
    });

    describe('create mode', () => {
        test('Display modal in create mode', async () => {
            render(<EditRecordModal open library="test_lib" onClose={jest.fn()} record={null} />);

            const createRecord = await screen.findByDisplayValue('CreateRecord');
            expect(createRecord).toBeInTheDocument();

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
                />,
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
                />,
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

        test('Should call purgeRecord on cancel creation', async () => {
            const mockOnClose = jest.fn();
            render(<EditRecordModal open library="test_lib" onClose={mockOnClose} record={null} />);

            await userEvent.click(screen.getByRole('button', {name: 'global.cancel'}));
            expect(mockOnClose).toHaveBeenCalledTimes(1);
            expect(mockUsePurgeRecordMutation).toHaveBeenCalled();
        });

        test('Should call onClose if some fields are touched on confirm', async () => {
            const mockOnClose = jest.fn();
            render(<EditRecordModal open library="test_lib" onClose={mockOnClose} record={null} />);

            expect(
                screen.queryByRole('heading', {level: 2, name: 'record_edition.cancel_confirm_modal_title'}),
            ).not.toBeInTheDocument();
            const createRecord = await screen.findByDisplayValue('CreateRecord');
            await userEvent.type(createRecord, 'Something');
            await userEvent.click(screen.getByRole('button', {name: 'global.cancel'}));
            const modalTitle = await screen.findByText('record_edition.cancel_confirm_modal_title');
            expect(modalTitle).toBeInTheDocument();
            expect(mockOnClose).not.toHaveBeenCalled();

            await userEvent.click(screen.queryByText('global.confirm'));
            expect(screen.queryByText('record_edition.cancel_confirm_modal_title')).not.toBeInTheDocument();
            expect(mockOnClose).toHaveBeenCalled();
        });

        test('Should call createRecord if modal is opened', async () => {
            render(<EditRecordModal open library="test_lib" onClose={jest.fn()} record={null} />);

            expect(mockUseCreateRecordMutation).toHaveBeenCalled();
        });

        test('Should not call createRecord if modal is not opened', async () => {
            render(<EditRecordModal open={false} library="test_lib" onClose={jest.fn()} record={null} />);

            expect(mockUseCreateRecordMutation).not.toHaveBeenCalled();
        });
    });

    describe('edit mode', () => {
        test('Display modal in edit mode', async () => {
            render(<EditRecordModal open library="test_lib" onClose={jest.fn()} record={mockRecord} />);

            expect(screen.getByDisplayValue('EditRecord')).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /close/, hidden: true})).toBeInTheDocument();
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
                />,
            );

            const createRecord = await screen.findByDisplayValue('CreateRecord');
            expect(createRecord).toBeInTheDocument();

            await user.click(screen.getByText('record_edition.create_and_edit'));

            const editButton = await screen.findByDisplayValue('EditRecord');
            await waitFor(() => {
                expect(editButton).toBeInTheDocument();
            });
        });

        test('Should not open modal on click on close', async () => {
            const mockOnClose = jest.fn();
            render(<EditRecordModal open library="test_lib" onClose={mockOnClose} record={mockRecord} />);

            expect(
                screen.queryByRole('heading', {level: 2, name: 'record_edition.cancel_confirm_modal_title'}),
            ).not.toBeInTheDocument();
            await userEvent.type(screen.getByDisplayValue('EditRecord'), 'Something');
            const closeButton = await screen.findByRole('button', {name: 'global.close', hidden: true});
            await userEvent.click(closeButton);

            expect(screen.queryByText('record_edition.cancel_confirm_modal_title')).not.toBeInTheDocument();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe('custom form ids', () => {
        test('Should call EditRecord with creation FromId', async () => {
            render(
                <EditRecordModal
                    open
                    creationFormId="creation-form"
                    editionFormId="edition-form"
                    library="test_lib"
                    onClose={jest.fn()}
                    record={null}
                    submitButtons={['createAndEdit']}
                />,
            );

            await waitFor(() => {
                expect(editRecordFn).toHaveBeenCalledWith(
                    expect.objectContaining({
                        formId: 'creation-form',
                    }),
                );
            });
        });

        test('Shoud call EditRecord with edition FromId', async () => {
            render(
                <EditRecordModal
                    open
                    creationFormId="creation-form"
                    editionFormId="edition-form"
                    library="test_lib"
                    onClose={jest.fn()}
                    record={{id: '123456', library: {id: 'test_lib'}}}
                    submitButtons={['createAndEdit']}
                />,
            );

            expect(editRecordFn).toHaveBeenCalledWith(
                expect.objectContaining({
                    formId: 'edition-form',
                }),
            );
        });
    });
});
