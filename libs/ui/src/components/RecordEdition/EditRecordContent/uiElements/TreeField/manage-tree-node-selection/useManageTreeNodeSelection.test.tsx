// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen, waitFor} from '@testing-library/react';
import {APICallStatus} from '../../../_types';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useManageTreeNodeSelection} from './useManageTreeNodeSelection';
import userEvent from '@testing-library/user-event';
import {mockFormAttribute} from '_ui/__mocks__/common/attribute';

const mockSetFieldValue = jest.fn();
const mockSetFields = jest.fn();
const mockSetBackendValues = jest.fn();
const mockOnValueSubmit = jest.fn();
const mockOnValueDelete = jest.fn();
const mockOnDeleteMultipleValues = jest.fn();

jest.mock('aristid-ds', () => ({
    AntForm: {
        useFormInstance: jest.fn(() => ({
            setFieldValue: mockSetFieldValue,
            setFields: mockSetFields
        }))
    }
}));

jest.mock('_ui/hooks/useSharedTranslation', () => ({
    useSharedTranslation: jest.fn()
}));

jest.mock('./SelectTreeNodeModal', () => ({
    SelectTreeNodeModal: ({onConfirm, onClose}) => (
        <div data-testid="select-tree-node-modal">
            <button data-testid="confirm-selection" onClick={() => onConfirm(mockSelectedNodeOnConfirm)}>
                Confirm Selection
            </button>
            <button data-testid="close-modal" onClick={onClose}>
                Close
            </button>
        </div>
    )
}));

jest.mock('../../shared/DeleteAllValuesButton', () => ({
    DeleteAllValuesButton: ({handleDelete, disabled, danger, children}) => (
        <button
            data-testid="delete-all-button"
            onClick={handleDelete}
            disabled={disabled}
            style={{color: danger ? 'red' : 'inherit'}}
        >
            {children || 'global.delete_all'}
        </button>
    )
}));

// Test component to use the hook
const TestComponent = ({hookProps}) => {
    const {openModal, removeTreeNode, actionButtonLabel, SelectTreeNodeModal, RemoveAllTreeNodes} =
        useManageTreeNodeSelection(hookProps);

    return (
        <div>
            <button data-testid="open-modal" onClick={openModal}>
                {actionButtonLabel}
            </button>
            <button
                data-testid="remove-node"
                onClick={() => removeTreeNode(hookProps.backendValues[0])}
                disabled={hookProps.backendValues.length === 0}
            >
                Remove First Node
            </button>
            {RemoveAllTreeNodes}
            {SelectTreeNodeModal}
        </div>
    );
};

const mockBackendValue = {
    id_value: 'value_1',
    treeValue: {id: 'tree_1', title: 'Node 1'},
    version: {},
    metadata: []
};

const mockBackendValues = [
    {
        id_value: 'value_1',
        treeValue: {id: 'tree_1', title: 'Node 1'},
        version: {},
        metadata: []
    },
    {
        id_value: 'value_2',
        treeValue: {id: 'tree_2', title: 'Node 2'},
        version: {},
        metadata: []
    }
];

const mockSelectedNode1 = {id: 'tree_2', title: 'Node 2'};
const mockSelectedNode2 = {id: 'tree_3', title: 'Node 3'};
let mockSelectedNodeOnConfirm = [mockSelectedNode1, mockSelectedNode2];

const hookProps = {
    modaleTitle: 'Test Tree',
    attribute: mockFormAttribute,
    backendValues: [],
    setBackendValues: mockSetBackendValues,
    onValueSubmit: mockOnValueSubmit,
    onValueDelete: mockOnValueDelete,
    onDeleteMultipleValues: mockOnDeleteMultipleValues,
    isReadOnly: false,
    isFieldInError: false
};

const addTreeNodeSuccessResponse = {
    status: APICallStatus.SUCCESS,
    values: [
        {
            id_value: 'new_value_1',
            treeValue: mockSelectedNode1,
            version: [],
            metadata: []
        },
        {
            id_value: 'new_value_2',
            treeValue: mockSelectedNode2,
            version: [],
            metadata: []
        }
    ]
};

const addTreeNodeSingleSuccessResponse = {
    status: APICallStatus.SUCCESS,
    values: [
        {
            id_value: 'new_value_1',
            treeValue: mockSelectedNode1,
            version: [],
            metadata: []
        }
    ]
};

const addTreeNodeErrorResponse = {
    status: APICallStatus.ERROR,
    errors: [{input: mockSelectedNode1.id, message: 'Invalid node'}]
};

const successResponse = {
    status: APICallStatus.SUCCESS
};

const errorResponse = {
    status: APICallStatus.ERROR
};

describe('useManageTreeNodeSelection', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        mockSelectedNodeOnConfirm = [mockSelectedNode1, mockSelectedNode2];

        (useSharedTranslation as jest.Mock).mockReturnValue({t: jest.fn(key => key)});
        jest.clearAllMocks();
    });

    it('should open and close modal', async () => {
        render(<TestComponent hookProps={hookProps} />);

        expect(screen.queryByTestId('select-tree-node-modal')).not.toBeInTheDocument();

        await user.click(screen.getByTestId('open-modal'));

        expect(screen.getByTestId('select-tree-node-modal')).toBeInTheDocument();

        await user.click(screen.getByTestId('close-modal'));

        await waitFor(() => {
            expect(screen.queryByTestId('select-tree-node-modal')).not.toBeInTheDocument();
        });
    });

    it('should add tree nodes successfully', async () => {
        mockOnValueSubmit.mockResolvedValue(addTreeNodeSuccessResponse);

        render(<TestComponent hookProps={hookProps} />);

        await user.click(screen.getByTestId('open-modal'));
        await user.click(screen.getByTestId('confirm-selection'));

        expect(mockOnValueSubmit).toHaveBeenCalledWith(
            [
                {attribute: mockFormAttribute, idValue: null, value: mockSelectedNode1},
                {attribute: mockFormAttribute, idValue: null, value: mockSelectedNode2}
            ],
            null
        );
        expect(mockSetFieldValue).toHaveBeenCalledWith(mockFormAttribute.id, [
            mockSelectedNode1.id,
            mockSelectedNode2.id
        ]);
        expect(mockSetFields).toHaveBeenCalledWith([{name: mockFormAttribute.id, errors: []}]);
        expect(mockSetBackendValues).toHaveBeenCalledWith([
            {
                id_value: 'new_value_1',
                treeValue: mockSelectedNode1,
                version: {},
                metadata: []
            },
            {
                id_value: 'new_value_2',
                treeValue: mockSelectedNode2,
                version: {},
                metadata: []
            }
        ]);
    });

    it('should add a tree node and remove the previous one if not multiple values', async () => {
        mockSelectedNodeOnConfirm = [mockSelectedNode1];
        mockOnValueSubmit.mockResolvedValue(addTreeNodeSingleSuccessResponse);
        mockOnValueDelete.mockResolvedValue(successResponse);

        render(
            <TestComponent
                hookProps={{
                    ...hookProps,
                    backendValues: [mockBackendValue]
                }}
            />
        );
        await user.click(screen.getByTestId('open-modal'));
        await user.click(screen.getByTestId('confirm-selection'));
        expect(mockOnValueSubmit).toHaveBeenCalledWith(
            [{attribute: mockFormAttribute, idValue: null, value: mockSelectedNode1}],
            null
        );
        expect(mockOnValueDelete).toHaveBeenCalledWith({id_value: mockBackendValue.id_value}, mockFormAttribute.id);
    });

    it('should handle error when adding tree nodes', async () => {
        mockOnValueSubmit.mockResolvedValue(addTreeNodeErrorResponse);

        render(<TestComponent hookProps={hookProps} />);

        await user.click(screen.getByTestId('open-modal'));
        await user.click(screen.getByTestId('confirm-selection'));

        expect(mockOnValueSubmit).toHaveBeenCalledWith(
            [
                {attribute: mockFormAttribute, idValue: null, value: mockSelectedNode1},
                {attribute: mockFormAttribute, idValue: null, value: mockSelectedNode2}
            ],
            null
        );
        expect(mockSetFields).toHaveBeenCalledWith([
            {
                name: mockFormAttribute.id,
                errors: [`${mockSelectedNode1.title}: Invalid node`]
            }
        ]);
        expect(mockSetBackendValues).not.toHaveBeenCalled();
    });

    it('should remove a tree node successfully', async () => {
        mockOnValueDelete.mockResolvedValue(successResponse);

        render(<TestComponent hookProps={{...hookProps, backendValues: [mockBackendValue]}} />);

        await user.click(screen.getByTestId('remove-node'));

        expect(mockOnValueDelete).toHaveBeenCalledWith({id_value: mockBackendValue.id_value}, mockFormAttribute.id);
        expect(mockSetFieldValue).toHaveBeenCalledWith(mockFormAttribute.id, []);
        expect(mockSetFields).toHaveBeenCalledWith([{name: mockFormAttribute.id, errors: []}]);
        expect(mockSetBackendValues).toHaveBeenCalledWith([]);
    });

    it('should remove a tree node sucessfully and set field in error if attribute is required', async () => {
        mockOnValueDelete.mockResolvedValue(successResponse);

        render(
            <TestComponent
                hookProps={{
                    ...hookProps,
                    backendValues: [mockBackendValue],
                    attribute: {...mockFormAttribute, required: true}
                }}
            />
        );

        await user.click(screen.getByTestId('remove-node'));

        expect(mockSetFields).toHaveBeenCalledWith([
            {
                name: mockFormAttribute.id,
                errors: ['errors.standard_field_required']
            }
        ]);
    });

    it('should handle error when removing a tree node', async () => {
        mockOnValueDelete.mockResolvedValue(errorResponse);

        render(<TestComponent hookProps={{...hookProps, backendValues: [mockBackendValue]}} />);

        await user.click(screen.getByTestId('remove-node'));

        expect(mockOnValueDelete).toHaveBeenCalledWith({id_value: mockBackendValue.id_value}, mockFormAttribute.id);
        expect(mockSetFieldValue).not.toHaveBeenCalled();
        expect(mockSetFields).toHaveBeenCalledWith([
            {
                name: mockFormAttribute.id,
                errors: ['error.error_occurred']
            }
        ]);
        expect(mockSetBackendValues).not.toHaveBeenCalled();
    });

    it('should remove all tree nodes successfully', async () => {
        mockOnDeleteMultipleValues.mockResolvedValue(successResponse);

        render(
            <TestComponent
                hookProps={{
                    ...hookProps,
                    backendValues: mockBackendValues,
                    attribute: {...mockFormAttribute, multiple_values: true}
                }}
            />
        );

        await user.click(screen.getByTestId('delete-all-button'));

        expect(mockOnDeleteMultipleValues).toHaveBeenCalledWith(mockFormAttribute.id, mockBackendValues, null);
        expect(mockSetFieldValue).toHaveBeenCalledWith(mockFormAttribute.id, []);
        expect(mockSetBackendValues).toHaveBeenCalledWith([]);
    });

    it('should handle error when removing all tree nodes', async () => {
        mockOnDeleteMultipleValues.mockResolvedValue(errorResponse);

        render(
            <TestComponent
                hookProps={{
                    ...hookProps,
                    backendValues: mockBackendValues,
                    attribute: {...mockFormAttribute, multiple_values: true}
                }}
            />
        );

        await user.click(screen.getByTestId('delete-all-button'));

        expect(mockOnDeleteMultipleValues).toHaveBeenCalledWith(mockFormAttribute.id, mockBackendValues, null);
        expect(mockSetFieldValue).not.toHaveBeenCalled();
        expect(mockSetFields).toHaveBeenCalledWith([
            {
                name: mockFormAttribute.id,
                errors: ['error.error_occurred']
            }
        ]);
        expect(mockSetBackendValues).not.toHaveBeenCalled();
    });
    //     const hookProps = {
    //         modaleTitle: 'Test Tree',
    //         attribute: {
    //             ...mockAttribute,
    //             multiple_values: false
    //         },
    //         backendValues: [mockBackendValue],
    //         setBackendValues: mockSetBackendValues,
    //         onValueSubmit: mockOnValueSubmit,
    //         onValueDelete: mockOnValueDelete,
    //         onDeleteMultipleValues: mockOnDeleteMultipleValues,
    //         isReadOnly: false,
    //         isFieldInError: false
    //     };

    //     // Act
    //     render(<TestComponent hookProps={hookProps} />);

    //     // Assert
    //     expect(screen.getByTestId('open-modal')).toHaveTextContent('global.replace Test Tree');
    // });
});
