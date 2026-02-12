// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {screen, render, waitFor, act} from '_ui/_tests/testUtils';
import {mockRecord} from '_ui/__mocks__/common/record';
import {EditRecordPage} from './EditRecordPage';
import {Form} from 'antd';
import * as gqlTypes from '_ui/_gqlTypes';

let user!: ReturnType<typeof userEvent.setup>;

const editRecordFn = jest.fn();
jest.mock('../EditRecord', () => ({
    EditRecord: ({antdForm, formElementId, isFormCreationMode, onCreate, ...props}) => {
        editRecordFn(props);
        const fields = [{name: 'jeanjau', value: !isFormCreationMode ? 'EditRecord' : 'CreateRecord'}];
        return (
            <Form form={antdForm} id={formElementId} fields={fields} onFinish={() => onCreate(mockRecord)}>
                <Form.Item name="jeanjau">
                    <input />
                </Form.Item>
                <button onClick={() => onCreate(mockRecord)}>simulate_create_record</button>
            </Form>
        );
    },
}));

const mockUseCreateRecordMutation = jest.fn().mockReturnValue({
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
const mockUsePurgeRecordMutation = jest.fn().mockReturnValue({
    data: {
        purgeRecord: {
            record: {
                id: 'new_record_id',
            },
        },
    },
});

describe('EditRecordPage', () => {
    beforeEach(() => {
        user = userEvent.setup();
        jest.spyOn(gqlTypes, 'useCreateRecordMutation').mockImplementation(() => [
            mockUseCreateRecordMutation,
            {loading: false, called: false, client: null, reset: null, error: null},
        ]);
        jest.spyOn(gqlTypes, 'usePurgeRecordMutation').mockImplementation(() => [
            mockUsePurgeRecordMutation,
            {loading: false, called: false, client: null, reset: null, error: null},
        ]);
    });

    describe('create mode', () => {
        test('Display page in create mode', async () => {
            render(<EditRecordPage library="test_lib" onClose={jest.fn()} record={null} />);

            const createRecord = await screen.findByDisplayValue('CreateRecord');
            expect(createRecord).toBeInTheDocument();
            expect(screen.getByText(/New Record/)).toBeInTheDocument();
            expect(screen.getByTestId('edit-record-modal-header-container-buttons')).toBeInTheDocument();
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
                />,
            );

            expect(screen.getByTestId('edit-record-modal-header-container-buttons')).toBeInTheDocument();
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
                />,
            );

            expect(screen.getByTestId('edit-record-modal-header-container-buttons')).toBeInTheDocument();
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
                screen.queryByRole('heading', {level: 2, name: 'record_edition.cancel_confirm_modal_title'}),
            ).not.toBeInTheDocument();
            const createRecord = await screen.findByDisplayValue('CreateRecord');
            await userEvent.type(createRecord, 'Something');
            await userEvent.click(screen.getByRole('button', {name: 'global.cancel'}));
            const modal = await screen.findByRole('dialog', {hidden: true});

            expect(modal).toBeVisible();
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
            expect(screen.getByTestId('edit-record-modal-header-container-buttons')).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /close/})).toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /submit/})).not.toBeInTheDocument();
        });

        test('Should display a custom title', async () => {
            render(<EditRecordPage library="test_lib" onClose={jest.fn()} record={mockRecord} title="Custom title" />);

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
                />,
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
                />,
            );

            expect(screen.getByTestId('edit-record-modal-header-container-buttons')).toBeInTheDocument();
            await waitFor(() => {
                expect(screen.getByDisplayValue('CreateRecord')).toBeInTheDocument();
            });
            await user.click(screen.getByText('record_edition.create_and_edit'));

            const editButton = await screen.findByDisplayValue('EditRecord');
            await waitFor(() => {
                expect(editButton).toBeInTheDocument();
            });
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
            />,
        );

        expect(screen.queryByLabelText('refresh')).not.toBeInTheDocument();
    });

    describe('custom form ids', () => {
        test('Shoud call EditRecord with creation FromId', async () => {
            render(
                <EditRecordPage
                    library="test_lib"
                    creationFormId="creation-form"
                    editionFormId="edition-form"
                    onClose={jest.fn()}
                    record={null}
                    title="Custom title"
                    showRefreshButton={false}
                />,
            );

            waitFor(() => {
                expect(editRecordFn).toHaveBeenCalledWith(
                    expect.objectContaining({
                        formId: 'creation-form',
                    }),
                );
            });
        });

        test('Shoud call EditRecord with edition FromId', async () => {
            render(
                <EditRecordPage
                    library="test_lib"
                    creationFormId="creation-form"
                    editionFormId="edition-form"
                    onClose={jest.fn()}
                    record={mockRecord}
                    title="Custom title"
                    showRefreshButton={false}
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
