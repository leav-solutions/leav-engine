// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import TreeField from './TreeField';
import {useDisplayTreeNode} from './display-tree-node/useDisplayTreeNode';
import {useManageTreeNodeSelection} from './manage-tree-node-selection/useManageTreeNodeSelection';
import {AntForm} from 'aristid-ds';
import {
    CalculatedFlags,
    computeCalculatedFlags,
    computeInheritedFlags,
    InheritedFlags
} from '../shared/calculatedInheritedFlags';
import {FormInstance} from 'antd';
import {mockFormElementTree} from '_ui/__mocks__/common/form';
import {RecordEditionContext} from '../../hooks/useRecordEditionContext';
import {mockRecord} from '_ui/__mocks__/common/record';
import {MockedLangContextProvider} from '_ui/testing';
import {initialState} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {RecordFormAttributeTreeAttributeFragment} from '_ui/_gqlTypes';
import * as useEditRecordReducer from '_ui/components/RecordEdition/editRecordReducer/useEditRecordReducer';

const mockInitialState = {...initialState};
const mockedUseFormInstance = AntForm.useFormInstance as jest.MockedFunction<typeof AntForm.useFormInstance>;
const mockedUseDisplayTreeNode = useDisplayTreeNode as jest.MockedFunction<typeof useDisplayTreeNode>;
const mockedUseManageTreeNodeSelection = useManageTreeNodeSelection as jest.MockedFunction<
    typeof useManageTreeNodeSelection
>;
const mockedComputeCalculatedFlags = computeCalculatedFlags as jest.MockedFunction<typeof computeCalculatedFlags>;
const mockedComputeInheritedFlags = computeInheritedFlags as jest.MockedFunction<typeof computeInheritedFlags>;

jest.mock('./display-tree-node/useDisplayTreeNode', () => ({
    useDisplayTreeNode: jest.fn()
}));

jest.mock('./manage-tree-node-selection/useManageTreeNodeSelection', () => ({
    useManageTreeNodeSelection: jest.fn()
}));

jest.mock('../shared/calculatedInheritedFlags', () => ({
    computeCalculatedFlags: jest.fn(),
    computeInheritedFlags: jest.fn()
}));

jest.mock('../shared/useOutsideInteractionDetector', () => ({
    useOutsideInteractionDetector: jest.fn()
}));

jest.mock('aristid-ds', () => ({
    ...jest.requireActual('aristid-ds'),
    AntForm: {
        Item: ({children, noStyle, ...props}: any) => (
            <div data-testid="form-item" {...props}>
                {children}
            </div>
        ),
        useFormInstance: jest.fn()
    }
}));

jest.spyOn(useEditRecordReducer, 'useEditRecordReducer').mockImplementation(() => ({
    state: mockInitialState,
    dispatch: jest.fn()
}));

describe('TreeField', () => {
    const treeFieldDefaultProps = {
        element: {
            ...mockFormElementTree,
            settings: {
                ...mockFormElementTree.settings,
                label: {fr: 'arbre', en: 'tree'}
            },
            attribute: {
                ...(mockFormElementTree.attribute as RecordFormAttributeTreeAttributeFragment),
                multiple_values: false
            }
        },
        readonly: false,
        formIdToLoad: 'creation',
        onValueSubmit: jest.fn(),
        onValueDelete: jest.fn(),
        onDeleteMultipleValues: jest.fn(),
        metadataEdit: false
    };

    const recordEditionContextDefaultProps = {
        record: mockRecord,
        readOnly: true,
        elements: null
    };

    const calculatedFlagsWithoutCalculatedValue: CalculatedFlags = {
        isCalculatedValue: false,
        isCalculatedOverrideValue: false,
        isCalculatedNotOverrideValue: false,
        calculatedValue: null
    };

    const inheritedFlagsWithoutInheritedValue: InheritedFlags = {
        isInheritedValue: false,
        isInheritedOverrideValue: false,
        isInheritedNotOverrideValue: false,
        inheritedValue: null
    };

    beforeEach(() => {
        jest.clearAllMocks();

        Object.assign(mockInitialState, initialState);

        mockedUseFormInstance.mockReturnValue({
            getFieldError: jest.fn().mockReturnValue([])
        } as unknown as FormInstance);

        mockedComputeCalculatedFlags.mockReturnValue(calculatedFlagsWithoutCalculatedValue);
        mockedComputeInheritedFlags.mockReturnValue(inheritedFlagsWithoutInheritedValue);

        mockedUseDisplayTreeNode.mockReturnValue({
            TreeNodeList: <div data-testid="tree-node-list">Tree Node List</div>
        } as any);

        mockedUseManageTreeNodeSelection.mockReturnValue({
            openModal: jest.fn(),
            removeTreeNode: jest.fn(),
            actionButtonLabel: 'Select Tree Node',
            SelectTreeNodeModal: <div data-testid="select-tree-node-modal">Select Tree Node Modal</div>,
            RemoveAllTreeNodes: <div data-testid="remove-all-tree-nodes">Remove All Tree Nodes</div>
        } as any);
    });

    it('should render with default props', () => {
        render(
            <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                <MockedLangContextProvider>
                    <TreeField {...treeFieldDefaultProps} />
                </MockedLangContextProvider>
            </RecordEditionContext.Provider>
        );

        expect(screen.getByTestId('tree-node-list')).toBeInTheDocument();
        expect(screen.getByTestId('select-tree-node-modal')).toBeInTheDocument();
        expect(screen.getByTestId('remove-all-tree-nodes')).toBeInTheDocument();
        expect(screen.getByText('Select Tree Node')).toBeInTheDocument();
    });

    it('should call useManageTreeNodeSelection with default props', () => {
        render(
            <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                <MockedLangContextProvider>
                    <TreeField {...treeFieldDefaultProps} />
                </MockedLangContextProvider>
            </RecordEditionContext.Provider>
        );

        expect(mockedUseManageTreeNodeSelection).toHaveBeenCalled();

        const callArgs = mockedUseManageTreeNodeSelection.mock.calls[0][0];

        expect(callArgs.modaleTitle).toBe('arbre');
        expect(callArgs.attribute).toBe(treeFieldDefaultProps.element.attribute);
        expect(callArgs.backendValues).toEqual(mockFormElementTree.values);
        expect(callArgs.isReadOnly).toBe(false);
        expect(callArgs.isFieldInError).toBe(false);
    });

    it('should call useDisplayTreeNode with default props', () => {
        render(
            <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                <MockedLangContextProvider>
                    <TreeField {...treeFieldDefaultProps} />
                </MockedLangContextProvider>
            </RecordEditionContext.Provider>
        );

        expect(mockedUseDisplayTreeNode).toHaveBeenCalled();

        const callArgs = mockedUseDisplayTreeNode.mock.calls[0][0];

        expect(callArgs.attribute).toBe(treeFieldDefaultProps.element.attribute);
        expect(callArgs.backendValues).toEqual(mockFormElementTree.values);
        expect(typeof callArgs.removeTreeNode).toBe('function');
    });

    it('should call useManageTreeNodeSelection with isReadOnly to true', () => {
        render(
            <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                <MockedLangContextProvider>
                    <TreeField {...treeFieldDefaultProps} readonly={true} />
                </MockedLangContextProvider>
            </RecordEditionContext.Provider>
        );

        const callArgs = mockedUseManageTreeNodeSelection.mock.calls[0][0];
        expect(callArgs.isReadOnly).toBe(true);
    });

    it('should call useManageTreeNodeSelection with isFieldInError to true', () => {
        mockedUseFormInstance.mockReturnValue({
            getFieldError: jest.fn().mockReturnValue(['Test error'])
        } as unknown as FormInstance);

        render(
            <RecordEditionContext.Provider value={recordEditionContextDefaultProps}>
                <MockedLangContextProvider>
                    <TreeField {...treeFieldDefaultProps} />
                </MockedLangContextProvider>
            </RecordEditionContext.Provider>
        );

        const callArgs = mockedUseManageTreeNodeSelection.mock.calls[0][0];
        expect(callArgs.isFieldInError).toBe(true);
    });
});
