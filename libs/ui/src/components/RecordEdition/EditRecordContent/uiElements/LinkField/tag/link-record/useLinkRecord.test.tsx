import {render, screen, renderHook, act, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useLinkRecord} from './useLinkRecord';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';
import {mockLinkValue} from '_ui/__mocks__/common/form';
import {APICallStatus} from '../../../../_types';

const mockOnValueSubmit = jest.fn();
const mockSetBackendValues = jest.fn();
const mockSetFields = jest.fn();

const mockBackendValue = {...mockLinkValue, id_value: 'existing_id_value'};

jest.mock('aristid-ds', () => ({
    AntForm: {
        useFormInstance: jest.fn(() => ({
            setFields: mockSetFields,
        })),
    },
    KitButton: ({children, onClick, ...props}: any) => (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    ),
    KitTooltip: ({children, title}: any) => <div data-tooltip={title}>{children}</div>,
}));

jest.mock('_ui/components/SelectRecordForLinkModal', () => ({
    SelectRecordForLinkModal: ({onSelectionCompleted, open}: any) =>
        open ? (
            <div data-testid="select-record-modal">
                <button
                    data-testid="select-single-record"
                    onClick={() => onSelectionCompleted({records: {list: [{id: 'new_record_id'}]}})}
                >
                    Select single
                </button>
                <button
                    data-testid="select-multiple-records"
                    onClick={() =>
                        onSelectionCompleted({records: {list: [{id: 'record_1'}, {id: 'record_2'}, {id: 'record_3'}]}})
                    }
                >
                    Select multiple
                </button>
            </div>
        ) : null,
}));

jest.mock('../../../TreeField/manage-tree-node-selection/SelectTreeNodeModal', () => ({
    SelectTreeNodeModal: ({onConfirm, open}: any) =>
        open ? (
            <div data-testid="select-tree-node-modal">
                <button data-testid="select-tree-node" onClick={() => onConfirm([{id: 'tree_node_id'}])}>
                    Select tree node
                </button>
            </div>
        ) : null,
}));

const multiValueAttribute = {...mockFormAttribute, multiple_values: true};
const singleValueAttribute = {...mockFormAttribute, multiple_values: false};

const defaultProps = {
    attribute: multiValueAttribute,
    onValueSubmit: mockOnValueSubmit,
    backendValues: [],
    setBackendValues: mockSetBackendValues,
    isReadOnly: false,
    joinLibraryContext: undefined as any,
};

const LinkRecordButtonWrapper = (props: typeof defaultProps) => {
    const {LinkRecordButton} = useLinkRecord(props);
    return <>{LinkRecordButton}</>;
};

describe('useLinkRecord', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('LinkRecordButton visibility', () => {
        it('should not display button when field is read only', () => {
            render(<LinkRecordButtonWrapper {...defaultProps} isReadOnly={true} />);

            expect(screen.queryByRole('button')).toBeNull();
        });
    });

    describe('LinkRecordButton tooltip', () => {
        it('should display "add" tooltip when field is empty', () => {
            render(<LinkRecordButtonWrapper {...defaultProps} backendValues={[]} />);

            expect(screen.getByRole('button').parentElement).toHaveAttribute('data-tooltip', 'global.add');
        });

        it('should display "add" tooltip when field is multi-values even with existing values', () => {
            render(
                <LinkRecordButtonWrapper
                    {...defaultProps}
                    attribute={multiValueAttribute}
                    backendValues={[mockBackendValue]}
                />,
            );

            expect(screen.getByRole('button').parentElement).toHaveAttribute('data-tooltip', 'global.add');
        });

        it('should display "replace" tooltip when field has value and is not multi-values', () => {
            render(
                <LinkRecordButtonWrapper
                    {...defaultProps}
                    attribute={singleValueAttribute}
                    backendValues={[mockBackendValue]}
                />,
            );

            expect(screen.getByRole('button').parentElement).toHaveAttribute('data-tooltip', 'global.replace');
        });
    });

    describe('when selecting records on multi-values field', () => {
        beforeEach(() => {
            mockOnValueSubmit.mockResolvedValue({
                status: APICallStatus.SUCCESS,
                values: [{id_value: 'new_1'}, {id_value: 'new_2'}, {id_value: 'new_3'}],
            });
        });

        it('should call onValueSubmit with all selected records', async () => {
            render(<LinkRecordButtonWrapper {...defaultProps} attribute={multiValueAttribute} />);

            await userEvent.click(screen.getByRole('button'));
            await userEvent.click(screen.getByTestId('select-multiple-records'));

            await waitFor(() => {
                expect(mockOnValueSubmit).toHaveBeenCalledWith(
                    expect.arrayContaining([
                        expect.objectContaining({value: expect.objectContaining({id: 'record_1'})}),
                        expect.objectContaining({value: expect.objectContaining({id: 'record_2'})}),
                        expect.objectContaining({value: expect.objectContaining({id: 'record_3'})}),
                    ]),
                    null,
                );
            });
        });

        it('should add new values to existing values on success', async () => {
            render(
                <LinkRecordButtonWrapper
                    {...defaultProps}
                    attribute={multiValueAttribute}
                    backendValues={[mockBackendValue]}
                />,
            );

            await userEvent.click(screen.getByRole('button'));
            await userEvent.click(screen.getByTestId('select-multiple-records'));

            await waitFor(() => {
                expect(mockSetBackendValues).toHaveBeenCalled();
            });

            const updateFn = mockSetBackendValues.mock.calls[0][0];
            const updatedValues = updateFn([mockBackendValue]);

            expect(updatedValues).toHaveLength(4);
            expect(updatedValues[0]).toEqual(mockBackendValue);
        });

        it('should display error on form field on error', async () => {
            const errorMessage = 'Link failed';
            mockOnValueSubmit.mockResolvedValue({status: APICallStatus.ERROR, error: errorMessage});

            render(<LinkRecordButtonWrapper {...defaultProps} attribute={multiValueAttribute} />);

            await userEvent.click(screen.getByRole('button'));
            await userEvent.click(screen.getByTestId('select-multiple-records'));

            await waitFor(() => {
                expect(mockSetFields).toHaveBeenCalledWith([
                    {
                        name: mockFormAttribute.id,
                        errors: [errorMessage],
                    },
                ]);
            });

            expect(mockSetBackendValues).not.toHaveBeenCalled();
        });
    });

    describe('when selecting a record on single-value field', () => {
        beforeEach(() => {
            mockOnValueSubmit.mockResolvedValue({
                status: APICallStatus.SUCCESS,
                values: [{id_value: 'new_value_id'}],
            });
        });

        it('should call onValueSubmit with existing idValue for replacement', async () => {
            render(
                <LinkRecordButtonWrapper
                    {...defaultProps}
                    attribute={singleValueAttribute}
                    backendValues={[mockBackendValue]}
                />,
            );

            await userEvent.click(screen.getByRole('button'));
            await userEvent.click(screen.getByTestId('select-single-record'));

            await waitFor(() => {
                expect(mockOnValueSubmit).toHaveBeenCalledWith(
                    [
                        expect.objectContaining({
                            value: expect.objectContaining({id: 'new_record_id'}),
                            idValue: 'existing_id_value',
                        }),
                    ],
                    null,
                );
            });
        });

        it('should call onValueSubmit with null idValue when no existing value', async () => {
            render(<LinkRecordButtonWrapper {...defaultProps} attribute={singleValueAttribute} backendValues={[]} />);

            await userEvent.click(screen.getByRole('button'));
            await userEvent.click(screen.getByTestId('select-single-record'));

            await waitFor(() => {
                expect(mockOnValueSubmit).toHaveBeenCalledWith(
                    [
                        expect.objectContaining({
                            idValue: null,
                        }),
                    ],
                    null,
                );
            });
        });

        it('should replace existing value on success', async () => {
            render(
                <LinkRecordButtonWrapper
                    {...defaultProps}
                    attribute={singleValueAttribute}
                    backendValues={[mockBackendValue]}
                />,
            );

            await userEvent.click(screen.getByRole('button'));
            await userEvent.click(screen.getByTestId('select-single-record'));

            await waitFor(() => {
                expect(mockSetBackendValues).toHaveBeenCalledWith([{id_value: 'new_value_id'}]);
            });
        });

        it('should display error on form field on error', async () => {
            const errorMessage = 'Replace failed';
            mockOnValueSubmit.mockResolvedValue({status: APICallStatus.ERROR, error: errorMessage});

            render(
                <LinkRecordButtonWrapper
                    {...defaultProps}
                    attribute={singleValueAttribute}
                    backendValues={[mockBackendValue]}
                />,
            );

            await userEvent.click(screen.getByRole('button'));
            await userEvent.click(screen.getByTestId('select-single-record'));

            await waitFor(() => {
                expect(mockSetFields).toHaveBeenCalledWith([
                    {
                        name: mockFormAttribute.id,
                        errors: [errorMessage],
                    },
                ]);
            });

            expect(mockSetBackendValues).not.toHaveBeenCalled();
        });
    });

    describe('when joinLibraryContext has a linked tree', () => {
        const joinLibraryContextWithTree = {
            mandatoryAttribute: {
                linked_tree: {
                    id: 'my_tree_id',
                },
            },
        };

        beforeEach(() => {
            mockOnValueSubmit.mockResolvedValue({
                status: APICallStatus.SUCCESS,
                values: [{id_value: 'new_tree_node_value'}],
            });
        });

        it('should open SelectTreeNodeModal instead of SelectRecordForLinkModal', async () => {
            render(
                <LinkRecordButtonWrapper
                    {...defaultProps}
                    attribute={singleValueAttribute}
                    joinLibraryContext={joinLibraryContextWithTree}
                />,
            );

            await userEvent.click(screen.getByRole('button'));

            expect(screen.getByTestId('select-tree-node-modal')).toBeInTheDocument();
            expect(screen.queryByTestId('select-record-modal')).not.toBeInTheDocument();
        });

        it('should call onValueSubmit with selected tree node', async () => {
            render(
                <LinkRecordButtonWrapper
                    {...defaultProps}
                    attribute={singleValueAttribute}
                    joinLibraryContext={joinLibraryContextWithTree}
                />,
            );

            await userEvent.click(screen.getByRole('button'));
            await userEvent.click(screen.getByTestId('select-tree-node'));

            await waitFor(() => {
                expect(mockOnValueSubmit).toHaveBeenCalledWith(
                    [expect.objectContaining({value: expect.objectContaining({id: 'tree_node_id'})})],
                    null,
                );
            });
        });
    });
});
